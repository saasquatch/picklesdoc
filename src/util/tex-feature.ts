import { Step, SubFeature, FeatureElement } from "./json";

/**
 * LaTeX document template
 */
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
\\setlength{\\parindent}{0pt}

\\renewcommand{\\familydefault}{\\sfdefault}

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

/**
 * Generates the LaTeX markup for a single feature file
 */
export function featureTex(input: SubFeature, depth: number): string {
  const tags = tagsTex(input.tags);
  const description = descriptionTex(input.description);

  const elements = input.featureElements.map(elementTex).join("\n");
  return `\\${getSectionDepth(depth)}{${sanitize(input.name)}}
    ${tags} ${tags.length > 0 ? "\\par" : ""}
    ${description}
    ${elements}
`;
}

/**
 * Generates the LaTeX markup for a single feature element
 * (Scenario, ScenarioOutline, Rule or Background)
 */
function elementTex(input: FeatureElement): string {
  const description = descriptionTex(input.description);
  const beforeComments = commentsTex(input.beforeComments);
  const afterComments = commentsTex(input.afterComments);

  const tags = tagsTex(input.tags);
  const title = `\\textbf{${input.elementType}}: ${sanitize(input.name)}`;
  const steps = stepsTex(input.steps);
  return `\\begin{tcolorbox}
  ${beforeComments}
  ${description}
  ${tags} \\par
  ${title} \\par
  ${steps.length > 0 ? steps + " \\par" : ""}
  ${afterComments}
\\end{tcolorbox}\n`;
}

/**
 * Generates a block of text for a feature or element description
 */
function descriptionTex(description: string): string {
  return description.length > 0
    ? `${sanitize(description.trim()).replace("\n\n", "\\par")} \\par`
    : "";
}

/**
 * Gray and italicized block of text for feature comments
 */
function commentsTex(comments: string[]): string {
  return comments.length > 0
    ? `${comments
        .map((c) => `\\textcolor{gray}{\\emph{${sanitize(c)}}}`)
        .join("\\par \n")} \\par`
    : "";
}

/**
 * Gray and bold text for feature or element tags
 */
function tagsTex(tags: string[]): string {
  return tags
    .map((tag) => `\\textcolor{gray}{\\textbf{${sanitize(tag)}}}`)
    .join(" ");
}

/**
 * Generates the \itemize block for the steps of an element
 * (given, when, then, etc)
 */
function stepsTex(steps: Step[]): string {
  if (steps.length === 0) return "";

  let color = "red";
  const stepTex = steps
    .map((step) => {
      color =
        step.keyword.toLowerCase() === "and" ? color : stepColor(step.keyword);
      return `    \\item \\textcolor{${color}}{\\textbf{${
        step.keyword
      }}} ${sanitize(step.text)}`;
    })
    .join("\n");

  return `\\begin{itemize}
    \\setlength\\itemsep{-1mm}
${stepTex}
  \\end{itemize}`;
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

export function getSectionDepth(depth: number): string {
  switch (depth) {
    case 0:
      return "section";
    case 1:
      return "subsection";
    case 2:
      return "subsubsection";
    case 3:
      return "paragraph";
    default:
      throw new Error(`Depth too large! Max folder structure depth is 3`);
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
