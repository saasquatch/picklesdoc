# PicklesDoc
[![npm version](https://badge.fury.io/js/picklesdoc.svg)](https://badge.fury.io/js/picklesdoc)

PicklesDoc is a program that converts .feature files written in Gherkin
language into Excel spreadsheets, LaTeX documents or JSON data.

This program is a cross-platform NodeJS port of the popular
[Pickles](https://www.picklesdoc.com/) program written in C#.

## Installation
```
npm install --global picklesdoc
```

## Usage
```
picklesdoc <command> [args]
```

### `picklesdoc xlsx <input> [out]`
Convert the provided file or directory into XLSX
##### Positionals
- `input` Input feature file or directory [required]
- `out` Output file or directory
##### Options
* `-h` `--help` Show help [boolean]
* `--testers` Number of tester columns to generate (for QA purposes) [number] [default: 0]
##### Examples
```
picklesdoc xlsx ./features my-spreadsheet.xlsx --testers=2
picklesdoc xlsx my-feature.feature my-spreadsheet.xlsx
picklesdoc xlsx ./features ./out --testers=3
```

### `picklesdoc tex <input> [out]`
Generate a LaTeX report of the feature or features. After generating the LaTeX document
you will need another program to convert it to a PDF. `picklesdoc` development uses
`pdflatex` for all its testing.
##### Positionals
- `input` Input feature file or directory [required]
- `out` Output file or directory. Will print to `STDOUT` if not specified
##### Options
* `-h` `--help` Show help [boolean]
* `--title` Title for the LaTeX document. [string] [default: "Features Report"]
##### Examples
```
picklesdoc tex ./features my-document.tex --title="Company Features Report"
picklesdoc tex my-feature.feature my-document.tex
picklesdoc tex ./features > output.tex
```

### `picklesdoc json <input> [out]`
Convert the provided file or directory into JSON
##### Positionals
- `input` Input feature file or directory [required]
- `out` Output file or directory. Will print to `STDOUT` if not specified
##### Options
* `-h` `--help` Show help [boolean]
##### Examples
```
picklesdoc json ./features my-output-file.json
picklesdoc json my-feature.feature > output.json
picklesdoc json my-feature.feature | jq
```
