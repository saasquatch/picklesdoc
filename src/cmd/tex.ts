import { generate as generateJson } from "../util/json";
import { pathInfo, gherkins, getOutputFileName, FType } from "../util/fio";
import { Arguments } from "yargs";
import { writeFileSync } from "fs";
import { featureTex, latexTemplate } from "../util/tex-feature";

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
  const files =
    pathInfo(inFile) === FType.Directory ? gherkins(inFile) : [inFile];
  const json = await generateJson(files);

  const body = json.features
    .map((feature) => {
      const tex = featureTex(feature.feature);
      return tex;
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
  const author = "picklesdoc v1.1.2";

  const output = latexTemplate(title, author, date, body);

  if (argv.out !== undefined) {
    writeFileSync(`${outFile}`, output);
    console.log(`LaTeX document written to ${outFile}`);
  } else {
    console.log(output);
  }
};
