import { IStore } from "../../stores/mod.ts";
import { dirname } from "https://deno.land/std/path/mod.ts";
import { existsSync } from "https://deno.land/std@0.210.0/fs/exists.ts";
import { Context } from "./mod.ts";
import { Meld } from "../../../../lib/lib.ts";

export const SESSION_CONTEXT = "session";
export const GLOBALS_CONTEXT = "globals";
const DEFAULT_MARKER = "_defaults";
const BLANK_ENTITY = {
  Id: "",
  Name: "",
} as Context;

export interface ILoader {
  globals(store: IStore): Promise<Context>;
  context(contextName: string, store: IStore): Promise<Context>;
  defaults(collectionPath: string, store: IStore): Promise<Context>;
  local(contextName: string, store: IStore): Promise<Context>;
}

export class Loader implements ILoader {
  async globals(store: IStore): Promise<Context> {
    return await this.context(GLOBALS_CONTEXT, store);
  }
  async local(contextName: string, store: IStore): Promise<Context> {
    return await this.context(contextName + ".local", store);
  }
  context(contextName: string, store: IStore): Promise<Context> {
    try {
      return store.get(Context.constructor.name, contextName) as Promise<Context>;
    } catch (e) {
      return Promise.resolve(BLANK_ENTITY);
    }
  }
  async defaults(collectionPath: string, store: IStore): Promise<Context> { // TODO: Bad, file-related
    const theRequest = new Context();
    const fileExtension = "JSON"; // TODO: Hardcoded
    const parser = await getDriver(fileExtension.toUpperCase());
    const defaultFilePaths = getDefaultFilePaths(collectionPath, fileExtension);
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = parser.parse(Deno.readTextFileSync(defaultFilePath));
        this.checkForbidden(fileContents);
        Meld(theRequest, fileContents);
      }
    }
    return theRequest;
  }
  private NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
  private checkForbidden(modelContents: any): void {
    for (const key of this.NO_DEFAULT_ALLOWED) {
      if (modelContents[key]) {
        throw new Error(`Forbidden key ${key}`);
      }
    }
  }
}
// TODO: Bad, file-related
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
function getDefaultsFilePath(collectionId: string, fileExtension: string): string {
  return `${collectionId}/${DEFAULT_MARKER}.${fileExtension}`;
}
