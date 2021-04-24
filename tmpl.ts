import * as Colors from "https://deno.land/std/fmt/colors.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { parse } from "https://deno.land/std/flags/mod.ts";
import { Bundle, cleanupPath } from './core/bundler.ts';

const VERSION = "0.0.1";
const HELP_HEAD = Colors.blue(`~{ ${Colors.bold('HTML Template Engine')} | v${VERSION} }~`);
const HELP_FOOTER = Colors.blue(`Licensed under the MIT license.
Copyright (C) ${Colors.bold('William Rågstad')}.`);

const currentDir = cleanupPath(new URL('.', import.meta.url).pathname.replace('/', '')); // Remove the first slash
const args = parse(Deno.args);
export enum StatusCode {
	Success = 0,
	Failure = 1,
	Pending = 2
}
const command = (cmd: string): boolean => args._.find((c: string | number) => typeof c == 'string' && c.toLowerCase() === cmd.toLowerCase()) !== undefined;
function execute(cmd: string, func: () => StatusCode): StatusCode {
	eConsole.success(`Executing command: ${Colors.bold(cmd)}`);
	return func();
}
const mapCommand = (cmd: string, func: () => StatusCode, statusCode: number): StatusCode => statusCode == StatusCode.Pending && command(cmd) ? execute(cmd, func) : statusCode;
const argHelp: boolean = args.help || args['?'];
const logColor = (color: (str: string) => string, data: any[]): void => console.log(...data.map(d => typeof d === 'string' ? color(d) : d));
console.info = (...data: any[]): void => logColor(Colors.cyan, data);
console.warn = (...data: any[]): void => logColor(Colors.yellow, data);
console.error = (...data: any[]): void => logColor(Colors.red, data);
const eConsole = console as Console & any;
eConsole.success = (...data: any[]): void => logColor(Colors.green, data);

const argFiles = (type: string) => args._.filter(f => existsSync(f.toString()) && f.toString().toLowerCase().endsWith(type.toLowerCase())) as string[];

function run(): StatusCode {
	if (argHelp) {
		console.info(`
 Usage: tmpl run [files] (options)

 Options:
 ¨¨¨¨¨¨¨
	[files]			- HTML files to process.
	--help, -?		- Show help for this command.
	--outF [file]		- Custom output file if single input file.
	--outD [path]		- Directory to write output files to.
	--outS [suffix]		- Change output files name suffixes.
`);
		return StatusCode.Success;
	}

	const filesHTML = argFiles('html');
	if (filesHTML.length == 0) {
		console.warn("No HTML files to process provided!");
		return StatusCode.Failure;
	}
	else if (args.outF != undefined) {
		// Expect single input file
		if (filesHTML.length > 1) {
			console.warn("Expected single input file, but got " + filesHTML.length);
			return StatusCode.Failure;
		}
		console.log(`> Root directory: ${currentDir}`);


		const file = filesHTML[0].replaceAll('\\', '/');
		const fileDirectory = currentDir + file.slice(0, file.lastIndexOf('/')) + '/';
		const relativeFilePath = file.slice(file.lastIndexOf('/') + 1);

		// console.log(relativeFilePath + " is in " + fileDirectory);

		return Bundle(relativeFilePath, args.outF.replaceAll('\\', '/'), fileDirectory, currentDir);
	}
	else {
		// Multiple input files
		const settings = {
			outDir: args.outDir ?? '',
			outSuffix: args.outS ?? '.tmpl.html'
		}
		console.log(`> Root directory: ${currentDir}`);
		console.log(`> Output directory: ${cleanupPath(currentDir + settings.outDir)}`);

		let failed = false;
		for (let file of filesHTML) {
			file = file.replaceAll('\\', '/');
			const fileDirectory = currentDir + file.slice(0, file.lastIndexOf('/')) + '/';
			const fileName = file.slice(file.lastIndexOf('/') + 1);
			const newFileName = fileName.slice(0, fileName.lastIndexOf('.')) + settings.outSuffix;

			// console.log(fileName + " is in " + fileDirectory);

			if (Bundle(fileName, newFileName, fileDirectory, currentDir + settings.outDir) == StatusCode.Failure) failed = true;
		}
		if (failed) return StatusCode.Failure;
		return StatusCode.Success;
	}
}

function main() {
	// console.log(currentDir);
	// console.log(args);
	let exitCode = StatusCode.Pending;

	exitCode = mapCommand('run', run, exitCode);

	// options when no command is provided
	if (exitCode == StatusCode.Pending) {
		if (argHelp) {
			console.info(`${HELP_HEAD}

 Usage: tmpl [command] (options)

 Commands:
 ¨¨¨¨¨¨¨¨
	run [files] (opt)	- Process a file and.

 Options:
 ¨¨¨¨¨¨¨
	--help, -?			- Show help for any command or usage.

${HELP_FOOTER}`);
			exitCode = StatusCode.Success;
		}
		else if (args.version) {
			console.log(VERSION)
			exitCode = StatusCode.Success;
		}
	}

	// Exit messages
	if (exitCode == StatusCode.Success) eConsole.success("\nSuccessfully finished without any errors!");
	else if (exitCode == StatusCode.Pending) console.warn("\nNo command was specified?\nUse -? or --help to see usage.");
	else console.error("\nAn error occurred while running.\nUse -? or --help or help to see usage.");

}


main();