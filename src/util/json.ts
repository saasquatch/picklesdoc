import * as moment from "moment";
import { version } from "../index";
import { parse } from "./parser";

export enum ElementType {
  Rule = "Rule",
  Background = "Background",
  Scenario = "Scenario",
  ScenarioOutline = "Scenario Outline",
}

export type Location = {
  line: number;
  column: number;
};

export type Example = {
  header: any[];
  data: any[][];
  beforeComments: string[];
  afterComments: string[];
};

export type Step = {
  keyword: string;
  rawKeyword: string;
  text: string;
  beforeComments: string[];
  afterComments: string[];
  docString: string;
  dataTable: string[][];
};

export type FeatureElement = {
  steps: Step[];
  examples: Example[];
  elementType: ElementType;
  name: string;
  description: string;
  location: Location;
  tags: string[];
  result: {
    wasExecuted: boolean;
    wasSuccessful: boolean;
    wasProvided: boolean;
  };
  beforeComments: string[];
  afterComments: string[];
};

export type SubFeature = {
  name: string;
  description: string;
  location: Location;
  featureElements: FeatureElement[];
  tags: string[];
  result: {
    wasExecuted: boolean;
    wasSuccessful: boolean;
    wasProvided: boolean;
  };
};

export type Feature = {
  relativeFolder: string;
  feature: SubFeature;
  result: {
    wasExecuted: boolean;
    wasSuccessful: boolean;
    wasProvided: boolean;
  };
};

export type GherkinJSON = {
  features: Feature[];
  summary: {
    tags: string[];
    folders: string[];
    notTestedFolders: string[];
    scenarios: {
      total: number;
      passing: number;
      failing: number;
      inconclusive: number;
    };
    features: {
      total: number;
      passing: number;
      failing: number;
      inconclusive: number;
    };
  };
  configuration: {
    version: string;
    program: string;
    generatedOn: string;
    generatedOnTimestamp: number;
  };
};

function parseChunk(chunk: any, json: GherkinJSON): void {
  if (!chunk) {
    throw new Error("Received undefined or null chunk from parser");
  }

  if (chunk.parseError) {
    const parseError = chunk.parseError;
    throw new Error(
      `Failed to parse chunk "${parseError.source.uri}": ${parseError.message}`
    );
  }

  const feature = chunk.gherkinDocument.feature;

  const tmp: Feature = {
    relativeFolder: chunk.gherkinDocument.uri,
    feature: {
      name: feature.name,
      description: feature.description,
      location: feature.location,
      featureElements: [],
      tags: feature.tags.map((tag: any) => tag.name),
      result: {
        wasExecuted: false,
        wasSuccessful: false,
        wasProvided: false,
      },
    },
    result: {
      wasExecuted: false,
      wasSuccessful: false,
      wasProvided: false,
    },
  };

  const comments = chunk.gherkinDocument.comments;

  feature.children.forEach((child: any) => {
    const element = child.rule
      ? child.rule
      : child.background
      ? child.background
      : child.scenario;

    json.summary.scenarios.total += 1;
    json.summary.scenarios.inconclusive += 1;

    const examples = element.examples
      ? element.examples.map((example: any) => {
          const commentsFound = commentCrawler(comments, example.location.line);
          return processExample(example, commentsFound);
        })
      : [];

    const elementType = child.rule
      ? ElementType.Rule
      : child.background
      ? ElementType.Background
      : examples.length > 0
      ? ElementType.ScenarioOutline
      : ElementType.Scenario;

    const steps = element.steps
      ? element.steps.map((step: any) => {
          const commentsFound = commentCrawler(comments, step.location.line);
          return processStep(step, commentsFound);
        })
      : [];

    const commentsFound = commentCrawler(comments, element.location.line);

    tmp.feature.featureElements.push({
      steps,
      examples,
      elementType,
      name: element.name,
      description: element.description || "",
      location: element.location,
      tags: element.tags ? element.tags.map((tag: any) => tag.name) : [],
      result: {
        wasExecuted: false,
        wasSuccessful: false,
        wasProvided: false,
      },
      beforeComments: commentsFound.before,
      afterComments: commentsFound.after,
    });
  });

  json.features.push(tmp);
  json.summary.features.total += 1;
  json.summary.features.inconclusive += 1;
}

export async function generate(files: string[]): Promise<GherkinJSON> {
  return new Promise<any>((resolve, reject) => {
    const stream = parse(files);

    const json: GherkinJSON = {
      features: [],
      summary: {
        tags: [],
        folders: [],
        notTestedFolders: [],
        scenarios: {
          total: 0,
          passing: 0,
          failing: 0,
          inconclusive: 0,
        },
        features: {
          total: 0,
          passing: 0,
          failing: 0,
          inconclusive: 0,
        },
      },
      configuration: {
        version,
        program: "picklesdoc",
        generatedOn: moment().format(),
        generatedOnTimestamp: moment().valueOf(),
      },
    };

    let errors = false;

    stream.on("data", (chunk: any) => {
      try {
        parseChunk(chunk, json);
      } catch (e) {
        errors = true;
        if (chunk?.gherkinDocument?.uri) {
          console.error(`Failed to parse "${chunk?.gherkinDocument?.uri}"`);
        }

        if (e instanceof Error) {
          console.error(e.message);
        }
      }
    });

    stream.on("error", (err: any) => {
      reject(err);
    });

    stream.on("finish", () => {
      if (errors !== false) {
        reject("Errors encountered during parsing.");
      } else {
        resolve(json);
      }
    });
  });
}

const commentCrawler = (comments: any, startingIndex: any) => {
  let currentIndex = startingIndex;

  const ret = {
    before: <string[]>[],
    after: <string[]>[],
  };

  let element;
  // eslint-disable-next-line no-cond-assign
  while (
    (element = comments.find((c: any) => c.location.line === currentIndex - 1))
  ) {
    ret.before.push(element.text.trim());
    currentIndex--;
  }

  currentIndex = startingIndex;

  // eslint-disable-next-line no-cond-assign
  while (
    (element = comments.find((c: any) => c.location.line === currentIndex + 1))
  ) {
    ret.after.push(element.text.trim());
    currentIndex++;
  }

  return ret;
};

function processStep(step: any, comments: any): Step {
  return {
    keyword: step.keyword.trim(),
    rawKeyword: step.keyword,
    text: step.text,
    beforeComments: comments.before,
    afterComments: comments.after,
    docString: step.docString ? step.docString.content : "",
    dataTable: step.dataTable
      ? step.dataTable.rows.map((row: any) => {
          return row.cells.map((cell: any) => cell.value);
        })
      : [],
  };
}

function processExample(example: any, comments: any): Example {
  return {
    header: example.tableHeader.cells.map((cell: any) => cell.value),
    data: example.tableBody.map((e: any) =>
      e.cells.map((cell: any) => cell.value)
    ),
    beforeComments: comments.before,
    afterComments: comments.after,
  };
}
