import { Step, SubFeature, FeatureElement } from "./json";

export function latexTemplate(
  title: string,
  author: string,
  date: string,
  body: string
): string {
  return `\\documentclass[11pt]{article}
\\usepackage[T1]{fontenc}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{tcolorbox}
\\usepackage{systeme}
\\usepackage{times}
\\usepackage{fancyhdr}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{tabularx}

\\usepackage[
    margin=0.7in,
    includefoot,
    footskip=30pt,
]{geometry}
\\usepackage{layout}

\\setcounter{tocdepth}{2}

\\title{${title}}
\\author{${author}}
\\date{${date}}

\\begin{document}
\\maketitle
\\tableofcontents

${body}

\\end{document}
`;
}

export function featureTex(input: SubFeature): string {
  const tags = tagsTex(input.tags);
  const elements = input.featureElements.map(elementTex).join("\n");
  return `\\section{${sanitize(input.name)}}
    ${tags} \\par
    ${elements}
`;
}

function elementTex(input: FeatureElement): string {
  if (input.steps.length === 0) return "";
  const tags = tagsTex(input.tags);
  const title = `\\textbf{${input.elementType}}: ${sanitize(input.name)}`;
  const steps = stepsTex(input.steps);
  return `\\begin{tcolorbox}
  ${tags} \\par
  ${title} \\par
  \\begin{itemize}
    \\setlength\\itemsep{-1mm}
${steps}
  \\end{itemize}
\\end{tcolorbox}\n`;
}

function tagsTex(tags: string[]): string {
  return tags
    .map((tag) => `\\textcolor{gray}{\\textbf{${sanitize(tag)}}}`)
    .join(" ");
}

function stepsTex(steps: Step[]): string {
  let color = "red";
  return steps
    .map((step) => {
      color =
        step.keyword.toLowerCase() === "and" ? color : stepColor(step.keyword);
      return `    \\item \\textcolor{${color}}{\\textbf{${
        step.keyword
      }}} ${sanitize(step.text)}`;
    })
    .join("\n");
}

function stepColor(keyword: string): string {
  switch (keyword.toLowerCase()) {
    case "given":
      return "MidnightBlue";
    case "when":
      return "LimeGreen";
    case "then":
      return "Dandelion";
    case "and":
      return "blue";
    case "but":
      return "purple";
    default:
      return "black";
  }
}

function sanitize(input: string): string {
  const symbolMap: { [key: string]: string } = {
    "\\": "\\textbackslash{}",
    "{": "\\{",
    "}": "\\}",
    $: "\\$",
    "&": "\\&",
    "#": "\\#",
    "^": "\\textasciicircum{}",
    _: "\\_",
    "~": "\\textasciitilde{}",
    "%": "\\%",
    "<": "\\textless{}",
    ">": "\\textgreater{}",
    "|": "\\textbar{}",
    '"': "\\textquotedbl{}",
    "'": "\\textquotesingle{}",
    "`": "\\textasciigrave{}",
  };

  return Array.from(input)
    .map((char) => symbolMap[char] || char)
    .join("");
}
