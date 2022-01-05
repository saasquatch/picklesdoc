import * as moment from "moment";
import { version } from "../index";
import { parse } from "./parser";
import * as messages from "cucumber-messages" ;

export enum ElementType {
  Rule = "Rule",
  Background = "Background",
  Scenario = "Scenario",
  Example = "Example",
  ScenarioOutline = "Scenario Outline",
  Example = "Example",
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

export type ScenarioElement = {
  elementType: ElementType.Scenario;
} & BaseFeatureElement;

export type ExampleElement = {
  elementType: ElementType.Example;
} & BaseFeatureElement;

export type ScenarioOutlineElement = {
  elementType: ElementType.ScenarioOutline;
  examples: Example[];
} & BaseFeatureElement;

export type BackgroundElement = {
  elementType: ElementType.Background;
} & BaseFeatureElement;

export type BaseFeatureElement = {
  steps: Step[];
} & BaseElement;

type BaseElement = {
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
}

export type FeatureElement = ScenarioElement | ScenarioOutlineElement | BackgroundElement | ExampleElement;

export type RuleElement = {
  elementType: ElementType.Rule;
  featureElements: FeatureElement[];
} & BaseElement;

export type FeatureOrRule = RuleElement | FeatureElement;

export type SubFeature = {
  featureElements: FeatureOrRule[];
  name: string;
  description: string;
  location: Location;
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

    stream.on("data", (chunk: any) => {
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

      // var featureOrRules: FeatureOrRule[] = []
      var featureElements: FeatureElement[] = []
      feature.children.forEach((child: any) => {
          let element = child.rule
          ? child.rule
          : child.background
          ? child.background
          : child.scenario;
        
          json.summary.scenarios.total += 1;
          json.summary.scenarios.inconclusive += 1;

          if (element == child.rule) {
            element.children.forEach((child: any) => {
              let element = child.rule
              ? child.rule
              : child.background
              ? child.background
              : child.scenario;
    
              const examples = element.examples
              ? element.examples.map((example: any) => {
                  const commentsFound = commentCrawler(
                    comments,
                    example.location.line
                  );
                  return processExample(example, commentsFound);
                })
              : [];
    
              const elementType = child.background
              ? ElementType.Background
              : child.example
              ? ElementType.Example
              : examples.length > 0
              ? ElementType.ScenarioOutline
              : ElementType.Scenario;
    
              const steps = element.steps
                ? element.steps.map((step: any) => {
                    const commentsFound = commentCrawler(
                      comments,
                      step.location.line
                    );
                    return processStep(step, commentsFound);
                  })
                : [];

              const commentsFound = commentCrawler(comments, element.location.line);

              const featureElement: FeatureElement = {
                elementType: elementType,
                steps: steps,
                examples: examples,
                name: element.name,
                description: element.description || "",
                location: element.Location,
                tags: element.tags ? element.tags.map((tag: any) => tag.name) : [],
                result: {
                  wasExecuted: false,
                  wasSuccessful: false,
                   wasProvided: false,
                },
                beforeComments: commentsFound.before,
                afterComments: commentsFound.after,
              }
              featureElements.splice(featureElements.length, 0, featureElement )
            });

            const commentsFound = commentCrawler(comments, element.location.line);

            let ruleElement: RuleElement = {
              elementType: ElementType.Rule,
              featureElements: featureElements,
              name: element.name,
              description: element.description || "",
              location: element.Location,
              tags: element.tags ? element.tags.map((tag: any) => tag.name) : [],
              result: {
                wasExecuted: false,
                wasSuccessful: false,
                 wasProvided: false,
              },
              beforeComments: commentsFound.before,
              afterComments: commentsFound.after,
            }

            tmp.feature.featureElements.splice(tmp.feature.featureElements.length,0, ruleElement)

            json.summary.scenarios.total += 1;
            json.summary.scenarios.inconclusive += 1;
      }
        else
        {
          const examples = element.examples
            ? element.examples.map((example: any) => {
                const commentsFound = commentCrawler(
                  comments,
                  example.location.line
                );
                return processExample(example, commentsFound);
              })
            : [];
  
          const elementType = child.background
            ? ElementType.Background
            : child.example
            ? ElementType.Example
            : examples.length > 0
            ? ElementType.ScenarioOutline
            : ElementType.Scenario;
  
          var steps = element.steps 
            ? element.steps.map((step: any) => {
                const commentsFound = commentCrawler(
                  comments,
                  step.location.line
                );
                return processStep(step, commentsFound);       
                })
            : [];

          const commentsFound = commentCrawler(comments, element.location.line);

          const featureElement: FeatureElement = {
            elementType: elementType,
            steps: steps,
            examples: examples,
            name: element.name,
            description: element.description || "",
            location: element.Location,
            tags: element.tags ? element.tags.map((tag: any) => tag.name) : [],
            result: {
              wasExecuted: false,
              wasSuccessful: false,
               wasProvided: false,
            },
            beforeComments: commentsFound.before,
            afterComments: commentsFound.after,
          }

          // featureOrRules.splice(featureOrRules.length, 0, featureElement);

          tmp.feature.featureElements.splice(tmp.feature.featureElements.length,0, featureElement)

        }  
      });
        
      json.features.push(tmp);
      json.summary.features.total += 1;
      json.summary.features.inconclusive += 1;
    });

    stream.on("error", (err: any) => {
      reject(err);
    });

    stream.on("finish", () => {
      resolve(json);
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
  // prettier-ignore
  // eslint-disable-next-line no-cond-assign
  while (element = comments.find((c: any) => c.location.line === currentIndex - 1)) {
      ret.before.push(element.text.trim());
      currentIndex--;
    }

  currentIndex = startingIndex;

  // prettier-ignore
  // eslint-disable-next-line no-cond-assign
  while (element = comments.find((c: any) => c.location.line === currentIndex + 1)) {
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

function processElements(element: any, comments: any, child: any, tmp: Feature){
  
  const examples = element.examples
  ? element.examples.map((example: any) => {
      const commentsFound = commentCrawler(
        comments,
        example.location.line
      );
      return processExample(example, commentsFound);
    })
  : [];

  const elementType = child.rule
    ? ElementType.Rule
    : child.background
    ? ElementType.Background
    : child.example
    ? ElementType.Example
    : examples.length > 0
    ? ElementType.ScenarioOutline
    : ElementType.Scenario;

  const steps = element.steps
    ? element.steps.map((step: any) => {
        const commentsFound = commentCrawler(
          comments,
          step.location.line
        );
        return processStep(step, commentsFound);
      })
    : [];

  const commentsFound = commentCrawler(comments, element.location.line);

}
