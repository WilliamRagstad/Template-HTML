import { DOMParser, Element, HTMLDocument } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { StatusCode } from "../tmpl.ts";

export function cleanupPath(path: string) {
	return path.replaceAll('%20', ' ');
}
const logPrefix = '  - ';
/**
 * Bundle a HTML file containing template imports
 * @param sourceFile Must exist inside sourceFileDir
 * @param targetFile Target output relative to sourceFileDir
 * @param sourceFileDir Directory containing source file, must end with a slash
 * @param targetFileDir Directory to write output to, must end with a slash
 * @returns A status code indicating whether the file was successfully bundled
 */
export function Bundle(sourceFile: string, targetFile: string, sourceFileDir: string, targetFileDir: string): StatusCode {
	const sourceFilePath = cleanupPath(sourceFileDir + sourceFile);
	const targetFilePath = cleanupPath(targetFileDir + targetFile);
	console.info("Bundling: " + sourceFile + " to " + targetFile);
	let content = undefined;
	try {
		content = Deno.readTextFileSync(sourceFilePath);
	} catch (error) {
		console.error(logPrefix + "Could not read '" + sourceFilePath + "' make sure the file exists!");
		return StatusCode.Failure;
	}
	const document = new DOMParser().parseFromString(content, 'text/html');
	if (document == undefined) return StatusCode.Failure;

	let failed = false;
	const tmplElements = document.getElementsByTagName('tmpl');
	for (const tmpl of tmplElements) {
		const template = loadTemplate(document, tmpl, sourceFileDir);
		if (template.type == TemplateType.Success) {
			const templateHTML = (new DOMParser().parseFromString(template.html, 'text/html') ?? new HTMLDocument()).body;
			// console.log("Parsed template HTML:\n\n", template.html, "\n\nto:\n\n", templateHTML.childNodes);
			tmpl.replaceWith(...templateHTML.childNodes);
		}
		else {
			console.error(logPrefix + 'Error: ' + template.message);
			failed = true;
		}
	}
	if (failed) return StatusCode.Failure;
	Deno.writeTextFileSync(targetFilePath, document.documentElement?.outerHTML ?? 'No Data');
	return StatusCode.Success;
}

enum TemplateType {
	Success,
	Error
}

type TemplateInfo = {
	type: TemplateType.Success,
	html: string
}
type TemplateError = {
	type: TemplateType.Error,
	message: string
}

function loadTemplate(document: HTMLDocument, element: Element, sourceFileDir: string): TemplateInfo | TemplateError {
	const templateSRC = element.getAttribute('src')?.replaceAll('\\', '/');
	if (templateSRC == null) return {
		type: TemplateType.Error,
		message: `Template element at index ${document.textContent.indexOf(element.textContent)} is missing a 'src' attribute!`
	}
	const templateFile = cleanupPath(sourceFileDir + templateSRC);
	let content;
	try {
		content = Deno.readTextFileSync(templateFile);
		console.log(logPrefix + 'Found template import src: ' + templateFile);
	} catch (error) {
		return {
			type: TemplateType.Error,
			message: 'Could not find template import src: ' + templateFile
		}
	}

	const args = parseArguments(element);
	const declarations = argumentVariableDeclarations(args);
	const HTMLExpression = declarations + `\n\`${content}\`;`;
	let producedHTML;
	try {
		producedHTML = eval(HTMLExpression);
	} catch (error) {
		return {
			type: TemplateType.Error,
			message: error.message
		}
	}

	// console.log(producedHTML);

	return {
		type: TemplateType.Success,
		html: producedHTML
	}
}

type Argument = {
	name: string,
	value: string
}

function parseArguments(element: Element): Argument[] {
	const result: Argument[] = [];
	for (const child of element.children) {
		result.push({
			name: child.tagName,
			value: child.innerHTML
		})
	}
	return result;
}

function argumentVariableDeclarations(args: Argument[]): string {
	return args.map(a => `const ${a.name} = \`${a.value}\`;`).join('\n');
}