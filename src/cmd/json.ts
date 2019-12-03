import { generate as generateJson } from "../util/json";
import { isDir, gherkins } from "../util/fio";
import { Arguments } from "yargs";
import { writeFileSync } from "fs";

export const command = "json <input> [out]";
export const desc = "Parse the provided file or directory into JSON";

export const builder = (yargs: any) => {
  return yargs
    .positional("input", {
      describe: "Input feature file or directory",
      type: "file"
    })
    .positional("out", {
      describe:
        "Output file or directory. Will print to STDOUT if not specified",
      type: "file"
    });
};

export const handler = async (argv: Arguments) => {
  const inFile = argv.input as string;
  const outFile = argv.out as string;
  const files = isDir(inFile) ? gherkins(inFile) : [inFile];

  const json = await generateJson(files);

  if (outFile !== undefined) {
    writeFileSync(outFile, JSON.stringify(json, undefined, 2));
  } else {
    console.log(JSON.stringify(json, undefined, 2));
  }
};
