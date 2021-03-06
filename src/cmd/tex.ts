import { writeFileSync } from "fs";
import { Arguments } from "yargs";
import { version } from "../index";
import {
  FType,
  getAllPaths,
  getOutputFileName,
  gherkins,
  pathInfo,
} from "../util/fio";
import { generate as generateJson } from "../util/json";
import {
  featureTex,
  getSectionDepth,
  latexTemplate,
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
    })
    .option("title", {
      describe: "The title of the document",
      type: "string",
      default: "Features Report",
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

      // Add the folder sections to the document so that we get
      // the right TOC structure
      if (allRelativePaths.length !== 0) {
        allRelativePaths.forEach((subPath, depth) => {
          if (!createdSections.has(subPath)) {
            output += `\\${getSectionDepth(depth)}{${
              subPath.charAt(0).toUpperCase() + subPath.slice(1)
            }}\n`;
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

  const title = argv.title as string;
  const author = `picklesdoc v${version}`;

  const output = latexTemplate(title, author, date, body);

  if (argv.out !== undefined) {
    writeFileSync(`${outFile}`, output);
    console.log(`LaTeX document written to ${outFile}`);
  } else {
    console.log(output);
  }
};
