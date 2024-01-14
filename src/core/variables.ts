import { existsSync } from "https://deno.land/std@0.210.0/fs/exists.ts";
import { dirname } from "https://deno.land/std/path/mod.ts";
import { Entity, Model, ModelType } from "./models.ts";
import { IStore } from "./app.ts";
const DEFAULT_MARKER = "_defaults";
export const SESSION_FILE = "session";
const GLOBALS_FILE = "globals";
const BLANK_ENTITY = {
  Id: "",
  Type: "",
  Name: "",
} as Model;

export { Load, Meld };

async function Load(subjectRequest: Entity, contextName: string, store: IStore): Promise<Entity> {
  const resultRequest = new Entity(subjectRequest.Id, subjectRequest.Name, subjectRequest.URL, subjectRequest.Method);
  const variables = new FileVariables() as IVariables;
  const globals = await variables.globals(store);
  const globalsLocal = await variables.local(GLOBALS_FILE, store);
  const context = await variables.context(contextName, store);
  const contextLocal = await variables.local(contextName, store);
  const defaults = await variables.defaults(dirname(subjectRequest.Id), store);
  const sessionLocal = await variables.local(SESSION_FILE, store);
  for (const item of [globals, globalsLocal, context, contextLocal, defaults, subjectRequest, sessionLocal]) {
    Meld(resultRequest, item);
  }
  console.log("Melded Variables:", JSON.stringify(resultRequest.Variables, null, 2));
  return resultRequest;
}

async function optionalContext(variables: IVariables, contextName: string, store: IStore): Promise<Model> {
  try {
    return await variables.context(contextName, store);
  } catch (e) {
    return BLANK_ENTITY;
  }
}

function Meld(destination: any, source: any): void {
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
  globals(store: IStore): Promise<Entity>;
  context(contextName: string, store: IStore): Promise<Entity>;
  defaults(collectionPath: string, store: IStore): Promise<Entity>;
  local(contextName: string, store: IStore): Promise<Entity>;
}

class FileVariables implements IVariables {
  async globals(store: IStore): Promise<Entity> {
    return await optionalContext(this, GLOBALS_FILE, store);
  }
  async local(contextName: string, store: IStore): Promise<Entity> {
    return await optionalContext(this, contextName + ".local", store);
  }
  context(contextName: string, store: IStore): Promise<Entity> {
    try {
      const result = store.get(ModelType.Context, contextName, contextName);
      return result;
    } catch (e) {
      console.log("error loading context", contextName, e);
      return Promise.resolve(BLANK_ENTITY);
    }
  }
  async defaults(collectionPath: string, store: IStore): Promise<Entity> {
    const theRequest = new Entity("", "", "", "");
    const fileExtension = "JSON"; // TODO: Hardcoded
    const parser = Parsers[fileExtension.toUpperCase()];
    const defaultFilePaths = getDefaultFilePaths(collectionPath, fileExtension);
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

function getDefaultFilePaths(requestFilePath: string, fileExtension: string): string[] {
  const defaultFilePaths = [];
  let currentDirectory = dirname(requestFilePath);
  while (currentDirectory !== "." && currentDirectory !== "") {
    defaultFilePaths.push(getDefaultsFilePath(currentDirectory + "/" + currentDirectory, fileExtension));
    currentDirectory = dirname(currentDirectory);
  }
  return defaultFilePaths.reverse();
}
function getDefaultsFilePath(collectionPath: string, fileExtension: string): string {
  return `${collectionPath}/${DEFAULT_MARKER}.${fileExtension}`;
}

const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
function checkForbidden(fileContents: any): void {
  for (const key of NO_DEFAULT_ALLOWED) {
    if (fileContents[key]) {
      throw new Error(`Forbidden key ${key}`);
    }
  }
}
