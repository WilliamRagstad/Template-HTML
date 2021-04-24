<div align="center">
     <img src="https://webstockreview.net/images/fountain-clipart-free-water-droplet-19.png" width="100px" />
     <h1>TMPL - Templates for HTML</h1>
     <p>A Deno templating engine for generating static HTML files.</p>
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

## Run
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



