import { version } from "../index";
import { generate as generateJson } from "../util/json";
import {
  pathInfo,
  gherkins,
  getOutputFileName,
  FType,
  getAllPaths,
} from "../util/fio";
import { Arguments } from "yargs";
import { writeFileSync } from "fs";
import {
  featureTex,
  latexTemplate,
  getSectionDepth,
} from "../util/tex-feature";

export const command = "tex <input> [out]";
export const desc = "Generate a LaTeX report of the feature or features";

export const builder = (yargs: any) => {
  return yargs
    .positional("input", {
      describe: "Input feature file or directory",
      type: "file",
    })
    .positional("out", {
      describe:
        "Output file or directory. Will print to STDOUT if not specified",
      type: "file",
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Generating LaTeX PDF...");

  const outFile = getOutputFileName(argv.out as string, ".tex");
  const inFile = argv.input as string;
  const basePathLength = getAllPaths(inFile, 0).length;
  const files =
    pathInfo(inFile) === FType.Directory ? gherkins(inFile) : [inFile];
  const json = await generateJson(files);
  const createdSections = new Set<string>();

  const body = json.features
    .map((f) => {
      let output = "";
      const allRelativePaths = getAllPaths(
        f.relativeFolder,
        basePathLength + 1
      );

      if (allRelativePaths.length !== 0) {
        allRelativePaths.forEach((subPath, depth) => {
          if (!createdSections.has(subPath)) {
            output += `\\${getSectionDepth(depth)}{${
              subPath.charAt(0).toUpperCase() + subPath.slice(1)
            }}`;
            createdSections.add(subPath);
          }
        });
      }

      output += featureTex(f.feature, allRelativePaths.length);
      return output;
    })
    .join("\n");

  let dateFormat = [
    { month: "short" },
    { day: "numeric" },
    { year: "numeric" },
  ];

  const currentDate = new Date();
  const format = (m: Intl.DateTimeFormatOptions) => {
    let f = new Intl.DateTimeFormat("en", m);
    return f.format(currentDate);
  };
  const date = dateFormat.map(format).join(" ");

  const title = "Features Overview";
  const author = `picklesdoc v${version}`;

  const output = latexTemplate(title, author, date, body);

  if (argv.out !== undefined) {
    writeFileSync(`${outFile}`, output);
    console.log(`LaTeX document written to ${outFile}`);
  } else {
    console.log(output);
  }
};
