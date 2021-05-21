# PicklesDoc
[![npm version](https://badge.fury.io/js/picklesdoc.svg)](https://badge.fury.io/js/picklesdoc)

PicklesDoc is a program that converts .feature files written in Gherkin
language into Excel spreadsheets or JSON data.

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
Parse the provided file or directory into XLSX
##### Positionals
- `input` Input feature file or directory [required]
- `out` Output file or directory
##### Options
* `-h` `--help` Show help [boolean]
* `--testers` Number of tester columns to generate (for QA purposes) [number] [default: 0]

### `picklesdoc json <input> [out]`
Parse the provided file or directory into JSON
##### Positionals
- `input` Input feature file or directory [required]
- `out` Output file or directory. Will print to `STDOUT` if not specified
##### Options
* `-h` `--help` Show help [boolean]
