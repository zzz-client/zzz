import { existsSync } from "https://deno.land/std@0.210.0/fs/exists.ts";
import { dirname } from "https://deno.land/std/path/mod.ts";
import { Context, Entity, Model, ModelType, StringToStringMap } from "../../core/models.ts";
import Application, { IStore } from "../../core/app.ts";
import { getDriver } from "../../stores/files/drivers.ts";
import Meld from "../../core/meld.ts";

const DEFAULT_MARKER = "_defaults";
export const SESSION_FILE = "session";
const GLOBALS_FILE = "globals";
const BLANK_ENTITY = {
  Id: "",
  Type: "",
  Name: "",
} as Context;

export default class VariablesModule {
  app: Application;
  static newInstance(app: Application) {
    return new VariablesModule(app);
  }
  constructor(app: Application) {
    this.app = app;
  }
  async load(theModel: Model, context: string): Promise<StringToStringMap> {
    return Load(theModel as Entity, context, await this.app.getStore());
  }
}

async function Load(subjectRequest: Entity, contextName: string, store: IStore): Promise<StringToStringMap> {
  const result = {};
  const variables = new FileVariables() as IVariables;
  const globals = await variables.globals(store);
  const globalsLocal = await variables.local(GLOBALS_FILE, store);
  const context = await variables.context(contextName, store);
  const contextLocal = await variables.local(contextName, store);
  const defaults = await variables.defaults(dirname(subjectRequest.Id), store);
  const sessionLocal = await variables.local(SESSION_FILE, store);
  for (const item of [globals, globalsLocal, context, contextLocal, defaults, subjectRequest, sessionLocal]) {
    Meld(result, item);
  }
  return (result as any).Variables;
}

function optionalContext(variables: IVariables, contextName: string, store: IStore): Promise<Context> {
  return variables.context(contextName, store).catch(() => {
    console.log("oh no");
    return Promise.resolve(BLANK_ENTITY);
  });
}

interface IVariables {
  globals(store: IStore): Promise<Context>;
  context(contextName: string, store: IStore): Promise<Context>;
  defaults(collectionPath: string, store: IStore): Promise<Context>;
  local(contextName: string, store: IStore): Promise<Context>;
}

class FileVariables implements IVariables {
  async globals(store: IStore): Promise<Context> {
    return await optionalContext(this, GLOBALS_FILE, store);
  }
  async local(contextName: string, store: IStore): Promise<Context> {
    return await optionalContext(this, contextName + ".local", store);
  }
  async context(contextName: string, store: IStore): Promise<Context> {
    try {
      const result = await store.get(ModelType.Context, contextName);
      return result;
    } catch (e) {
      return Promise.resolve(BLANK_ENTITY);
    }
  }
  async defaults(collectionPath: string, store: IStore): Promise<Context> {
    const theRequest = new Context("", "");
    const fileExtension = "JSON"; // TODO: Hardcoded
    const parser = await getDriver(fileExtension.toUpperCase());
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
  defaultFilePaths.push(getDefaultsFilePath(currentDirectory + "/" + currentDirectory, fileExtension));
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
