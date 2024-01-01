import { existsSync } from "https://deno.land/std@0.210.0/fs/exists.ts";
import { EntityType, Stores } from "./storage.ts";
import { getDirectoryForEntity, Parser, Parsers } from "./stores/file.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import ZzzRequest from "./request.ts";
import { IStore } from "./factories.ts";
const DEFAULT_MARKER = "_defaults";

export async function Load(folderName: string, environmentName: string, fileExtension: string): Promise<ZzzRequest> {
  const resultRequest = new ZzzRequest("", "", ""); // TODO: Is this hacky?
  const store = Stores[fileExtension.toUpperCase()];
  const variables = new FileVariables() as IVariables;
  const globals = await variables.globals(store);
  const environment = await variables.environment(environmentName, store);
  const defaults = await variables.defaults(folderName, store);
  Meld(resultRequest, globals);
  Meld(resultRequest, environment);
  Meld(resultRequest, defaults);
  return resultRequest;
}

export function Meld(destination: any, source: any): void {
  if (!source) {
    return;
  }
  for (const key of Object.keys(source)) {
    if (destination[key] !== undefined && typeof destination[key] === "object") {
      Meld(destination[key], source[key]);
    } else {
      destination[key] = source[key];
    }
  }
}

interface IVariables {
  globals(store: IStore): Promise<ZzzRequest>;
  environment(environmentName: string, store: IStore): Promise<ZzzRequest>;
  defaults(folderPath: string, store: IStore): Promise<ZzzRequest>;
}

class FileVariables implements IVariables {
  globals(store: IStore): Promise<ZzzRequest> {
    return store.get(EntityType.Environment, "globals", "Integrate"); // TODO: Hardcoded
  }
  environment(environmentName: string, store: IStore): Promise<ZzzRequest> {
    console.error("Loading env", environmentName);
    return store.get(EntityType.Environment, environmentName, environmentName);
  }
  async defaults(folderPath: string, store: IStore): Promise<ZzzRequest> {
    const resourceName = basename(folderPath);
    const theRequest = new ZzzRequest("", "", ""); // TODO: Is this hacky?
    const fileExtension = "JSON";
    const parser = Parsers[fileExtension.toUpperCase()];
    const defaultFilePaths = getDefaultFilePaths(resourceName, fileExtension);
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = parser.parse(Deno.readTextFileSync(defaultFilePath));
        checkForbidden(fileContents);
        Meld(theRequest, fileContents);
      }
    }
    const filePath = resourceName + "." + fileExtension;
    const fileContents = parser.parse(Deno.readTextFileSync(filePath));
    checkRequired(fileContents);
    Meld(theRequest, fileContents);
    const sessionPath = getEnvironmentPath("session.local", fileExtension);
    if (existsSync(sessionPath)) {
      const sessionContents = parser.parse(Deno.readTextFileSync(sessionPath));
      Meld(theRequest, sessionContents);
    }
    return theRequest;
  }
}

export function getEnvironmentPath(environmentName: string, fileExtension: string): string {
  return getDirectoryForEntity(EntityType.Environment) + `/${environmentName}.${fileExtension}`;
}
function getDefaultFilePaths(requestFilePath: string, fileExtension: string): string[] {
  const defaultFilePaths = [];
  let currentDirectory = dirname(requestFilePath);
  while (currentDirectory !== "." && currentDirectory !== "") {
    defaultFilePaths.push(getDefaultsFilePath(currentDirectory + "/" + currentDirectory, fileExtension));
    currentDirectory = dirname(currentDirectory);
  }
  return defaultFilePaths.reverse();
}
function getDefaultsFilePath(folderPath: string, fileExtension: string): string {
  return `${folderPath}/${DEFAULT_MARKER}.${fileExtension}`;
}

const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
function checkRequired(fileContents: any): void {
  for (const key of REQUIRED_ON_REQUEST) {
    if (!fileContents[key]) {
      throw new Error(`Missing required key ${key}`);
    }
  }
}
function checkForbidden(fileContents: any): void {
  for (const key of NO_DEFAULT_ALLOWED) {
    if (fileContents[key]) {
      throw new Error(`Forbidden key ${key}`);
    }
  }
}
