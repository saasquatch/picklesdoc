import { GherkinStreams } from "@cucumber/gherkin-streams";

/**
 * Parses the feature file and returns the stream
 * @param {String[]} paths The path to the feature file
 * @return {Stream} The stream of data from the Gherkin parser
 */
export function parse(paths: string[]) {
  const options = {
    includeSource: false,
    includeGherkinDocument: true,
    includePickles: false,
  };

  return GherkinStreams.fromPaths(paths, options);
}
