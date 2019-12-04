import { statSync, mkdirSync } from "fs";
import { dirname, parse } from "path";
import * as glob from "glob";
import * as moment from "moment";

export enum FType {
  File,
  Directory,
  NonExist
}

export function pathInfo(path: string): FType {
  try {
    return statSync(path).isDirectory() ? FType.Directory : FType.File;
  } catch (e) {
    if (e.code === "ENOENT") {
      return FType.NonExist;
    } else {
      throw e;
    }
  }
}

export function gherkins(dir: string): string[] {
  return glob.sync(`${dir}/**/*.feature`);
}

export function getOutputFileName(input: string, ext: string): string {
  const defaultFileName = `picklesdoc--${moment().format(
    "YYYY-MM-DD--HH-mm-ss"
  )}${ext}`;

  if (!input) {
    return defaultFileName;
  }

  switch (pathInfo(input)) {
    case FType.File:
      return input;
    case FType.Directory:
      return `${input}/${defaultFileName}`;
    case FType.NonExist:
      const parsedPath = parse(input);
      if (parsedPath.dir !== "" && parsedPath.dir !== ".") {
        mkdirSync(parsedPath.dir, { recursive: true });
      } else if (parsedPath.ext === "") {
        mkdirSync(parsedPath.name);
      }

      if (parsedPath.ext === "") {
        return `${input}/${defaultFileName}`;
      } else {
        return input;
      }
    default:
      throw new Error(`Invalid FType invariant found`);
  }
}

export function getAllPaths(file: string): string[] {
  return dirname(file).split("/");
}
