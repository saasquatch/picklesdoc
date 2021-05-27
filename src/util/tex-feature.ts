import { Example, FeatureElement, Step, SubFeature } from "./json";

const colors = [
  // MidnightBlue
  "\\definecolor{c1}{RGB}{0, 103, 149}",
  // LimeGreen
  "\\definecolor{c2}{RGB}{141, 199, 62}",
  // Dandelion
  "\\definecolor{c3}{RGB}{253, 188, 66}",
  // Blue
  "\\definecolor{c4}{RGB}{45, 47, 146}",
  // Purple
  "\\definecolor{c5}{RGB}{153, 71, 155}",
  // VioletRed
  "\\definecolor{c6}{RGB}{239, 88, 160}",
].join("\n");

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
\\usepackage[dvipsnames,table]{xcolor}
\\usepackage{tcolorbox}
\\usepackage{times}
\\usepackage{textcomp}
\\usepackage{tabularx}
\\usepackage{tocloft}
\\usepackage[hidelinks]{hyperref}

\\usepackage[
    margin=0.7in,
    includefoot,
    footskip=30pt,
]{geometry}
\\usepackage{layout}

\\setcounter{tocdepth}{2}
\\setlength{\\parindent}{0pt}

\\renewcommand{\\familydefault}{\\sfdefault}
\\addtolength{\\cftsubsecnumwidth}{1em}

\\newcommand{\\step}[2]{\\item \\textcolor{#1}{\\textbf{#2}}}
\\newcommand{\\tag}[1]{\\textcolor{gray}{\\textbf{#1}}}
\\newcommand{\\comm}[1]{\\textcolor{gray}{\\emph{#1}}}

${colors}

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
${tags} ${tags.length > 0 ? "\\par\n" : ""}${description}${elements}`;
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

  const examples =
    input.examples.length > 0
      ? "\n  " + input.examples.map(examplesTex).join("\\par\n")
      : "";

  return `\\begin{tcolorbox}${beforeComments}${description}${tags}
  ${title}\\par
  ${steps.length > 0 ? steps : ""}
${examples}${afterComments}\\end{tcolorbox}\n`;
}

function examplesTex(example: Example): string {
  const cols = example.header.length;
  const beforeComments = commentsTex(example.beforeComments);
  const afterComments = commentsTex(example.afterComments);

  return `\\textbf{Examples}:\\par${
    beforeComments.length > 0 ? "\n  " + beforeComments : ""
  }
  \\begin{center}
    \\begin{tabularx}{\\textwidth}{ ${"| X ".repeat(cols)}| }
      \\hline
      ${example.header
        .map((h) => `\\cellcolor{blue!25}\\textbf{${sanitize(h)}}`)
        .join(" & ")} \\\\
      \\hline
${example.data
  .map((row) => " ".repeat(8) + row.map(sanitize).join(" & ") + "\\\\\\hline")
  .join("\n")}
    \\end{tabularx}
  \\end{center}
${afterComments.length > 0 ? "  " + afterComments : ""}`;
}

/**
 * Generates a block of text for a feature or element description
 */
function descriptionTex(description: string): string {
  const d = description.trim();
  return d.length > 0 ? `${sanitize(d).replace("\n\n", "\\par")} \\par\n` : "";
}

/**
 * Gray and italicized block of text for feature comments
 */
function commentsTex(comments: string[]): string {
  return comments.length > 0
    ? `\n${comments
        .map((c) => `\\comm{${sanitize(c)}}`)
        .join("\\par \n")} \\par\n`
    : "";
}

/**
 * Gray and bold text for feature or element tags
 */
function tagsTex(tags: string[]): string {
  return tags.length > 0
    ? `\n  ${tags.map((tag) => `\\tag{${sanitize(tag)}}`).join(" ")} \\par`
    : "";
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
      return `    \\step{${color}}{${step.keyword}} ${sanitize(step.text)}`;
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
      return "c1";
    case "when":
      return "c2";
    case "then":
      return "c3";
    case "and":
      return "c4";
    case "but":
      return "c5";
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
    .join("")
    .replace(/(\\textless{}.*?\\textgreater{})/, "\\textcolor{c6}{$1}");
}
