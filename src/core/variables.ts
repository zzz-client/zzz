import { existsSync } from "https://deno.land/std@0.210.0/fs/exists.ts";
import { EntityType, Stores } from "./storage.ts";
import { getDirectoryForEntity, Parser, Parsers } from "./stores/file.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import ZzzRequest, { Entity } from "./request.ts";
import { IStore } from "./factories.ts";
const DEFAULT_MARKER = "_defaults";
const SESSION_FILE = "session";
const GLOBALS_FILE = "globals";
const BLANK_ENTITY = {
  Id: "",
  Type: "",
  Name: "",
} as Entity;

export async function Load(subjectRequest: ZzzRequest, entityName: string, environmentName: string, store: IStore): Promise<ZzzRequest> {
  checkRequired(subjectRequest);
  const resultRequest = new ZzzRequest(entityName, subjectRequest.Name, subjectRequest.URL, subjectRequest.Method);
  const variables = new FileVariables() as IVariables;
  const globals = await variables.globals(store);
  const globalsLocal = await variables.local(GLOBALS_FILE, store);
  const environment = await variables.environment(environmentName, store);
  const environmentLocal = await variables.local(environmentName, store);
  const defaults = await variables.defaults(dirname(entityName), store);
  const sessionLocal = await variables.local(SESSION_FILE, store);
  for (const item of [globals, globalsLocal, environment, environmentLocal, defaults, resultRequest, sessionLocal]) {
    Meld(resultRequest, item);
  }
  console.log("Melded", JSON.stringify(resultRequest.Variables, null, 2));
  return resultRequest;
}

async function optionalEnvironment(variables: IVariables, environmentName: string, store: IStore): Promise<Entity> {
  try {
    return await variables.environment(environmentName, store);
  } catch (e) {
    return BLANK_ENTITY;
  }
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
  local(environmentName: string, store: IStore): Promise<ZzzRequest>;
}

class FileVariables implements IVariables {
  async globals(store: IStore): Promise<ZzzRequest> {
    return await optionalEnvironment(this, GLOBALS_FILE, store);
  }
  async local(environmentName: string, store: IStore): Promise<ZzzRequest> {
    return await optionalEnvironment(this, environmentName + ".local", store);
  }
  environment(environmentName: string, store: IStore): Promise<ZzzRequest> {
    try {
      const result = store.get(EntityType.Environment, environmentName, environmentName);
      return result;
    } catch (e) {
      console.log("error loading environment");
      return Promise.resolve(BLANK_ENTITY);
    }
  }
  async defaults(folderPath: string, store: IStore): Promise<ZzzRequest> {
    const theRequest = new ZzzRequest("", "", "", "");
    const fileExtension = "JSON"; // TODO: Hardcoded
    const parser = Parsers[fileExtension.toUpperCase()];
    const defaultFilePaths = getDefaultFilePaths(folderPath, fileExtension);
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = parser.parse(Deno.readTextFileSync(defaultFilePath));
        checkForbidden(fileContents);
        Meld(theRequest, fileContents);
      }
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
