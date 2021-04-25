<div align="center">
    <img src="./assets/drop.png" width="60px"/>
    <h1><code>TMPL //Templates for HTML</code></h1>
    <h3>A templating engine for generating static HTML files.</h3>
</div>



# Introduction
TMPL is a flexible templating engine for bundling HTML files containing import tags into static, production ready files.
The main reason the TMPL project was created was the absence of simple standalone template compilers with simple and intuitive syntax. This became our vision when designing the semantics and developer experience for TMPL.

# Install
The engine is built for Deno using TypeScript, but features a standalone executable file for all platforms and build times.
Your project does not need to run on Deno, but it needs to be installed locally in case you plan on using the TypeScript standalone.
Both options provide a simple CLI for configuring and customizing the bundles and engine.

# Usage
Show a list of all commands and options available for one command using the `-?` or `--help` flag: `> tmpl -?`.

## Commands
### Run
Compile a set of files 
This is the main command you will be using.

```bash
Executing command: run

   Usage: tmpl run [files] (options)

   Options:
   ¨¨¨¨¨¨¨
        [files]                 - HTML files to process.
        --help, -?              - Show help for this command.
        --outF [file]           - Custom output file if single input file.
        --outD [path]           - Directory to write output files to.
        --outS [suffix]         - Change output files name suffixes.

Successfully finished without any errors!
```

## Files

### HTML Files

To include a template in HTML, create a `tmpl`-tag like in the example shows below.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Test document</title>
  </head>
  <body>
    <!-- Import the header template -->
    <tmpl src="head.tmpl">
      <title>My Test Document</title>
    </tmpl>
  </body>
</html>
```

The file extension for template files linked from HTML files is arbitrary and is up to you to set a standard.
The file `head.tmpl` may contain code like:

```html
<header>
  <h1>${TITLE}</h1>
  <p>
    Lorem ipsum dolor sit, amet consectetur adipisicing elit. Necessitatibus
    corporis odio unde excepturi quibusdam velit recusandae nihil dignissimos
    est dolorum tempora, voluptatum suscipit numquam nisi deserunt ab error
    quasi orporis odio unde excepturi quibusdam quas!
  </p>
</header>
```

As you might have notice, the syntax for inserting argument variables is similar to JavaScript, that because it *is* JavaScript.
Everything in between the `${` and the `}` is a valid JavaScript expression. The result after evaluating the expression is then inserted into the HTML structure.

The result of bundling the files shown above would look like this:

```html
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test document</title>
</head>
<body>
  <header>
    <h1>My Test Document</h1>
    <p>
      Lorem ipsum dolor sit, amet consectetur adipisicing elit. Necessitatibus
      corporis odio unde excepturi quibusdam velit recusandae nihil dignissimos
      est dolorum tempora, voluptatum suscipit numquam nisi deserunt ab error
      quasi orporis odio unde excepturi quibusdam quas!
    </p>
  </header>
</body>
</html>
```

