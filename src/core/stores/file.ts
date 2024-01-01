import { existsSync } from "https://deno.land/std/fs/mod.ts";
import Request, { Collection, Folder, Item, StringToStringMap } from "../request.ts";
import { EntityType } from "../storage.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import { Parser, Parsers } from "../render.ts";
import { IStore, Stats } from "../factories.ts";

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async stat(entityName: string): Promise<Stats> {
    const filePath = existsSync(entityName, { isDirectory: true }) ? entityName : `${entityName}.${this.fileExtension}`;
    const entType = await determineType(filePath);
    const file = await Deno.stat(filePath); // TODO: libs
    const stats = {
      Type: EntityType[entType],
      Name: entityName,
      Created: file.birthtime!,
      Modified: file.mtime!,
    } as Stats;
    if (entType == EntityType.Request) {
      stats.Size = (await Deno.stat(filePath)).size;
    } else if (entType == EntityType.Collection || entType == EntityType.Folder) {
      stats.Size = (() => {
        let s = 0;
        for (const _ in Deno.readDirSync(entityName)) {
          s++;
        }
        return s;
      })();
    }
    return stats;
  }
  async get(entityType: EntityType, entityName: string, environmentName: string): Promise<Item> {
    if (entityType === EntityType.Request) {
      const theRequest = new Request("", "", ""); // TODO: Is this hacky?
      this._load(theRequest, entityName, environmentName);
      if (!theRequest.Name) {
        theRequest.Name = basename(entityName);
      }
      return theRequest;
    }
    if (entityType === EntityType.Collection || entityType === EntityType.Folder) {
      const item = new (entityType === EntityType.Collection ? Collection : Folder)(basename(entityName));
      for await (const child of Deno.readDir(entityName)) {
        if (child.isDirectory) {
          item.Children.push(await this.get(EntityType.Folder, `${entityName}/${child.name}`, environmentName));
        } else if (child.isFile && filetypeSupported(child.name) && !excludeFromInfo(child.name)) {
          const baseless = basename(child.name, extname(child.name));
          item.Children.push(await this.get(EntityType.Request, `${entityName}/${baseless}`, environmentName));
        }
      }
      return item;
    }
    if (entityType === EntityType.Environment || entityType === EntityType.Authorization) {
      const entityFolder = getDirectoryForEntity(entityType);
      const filePath = `${entityFolder}/${entityName}.${this.fileExtension}`;
      return this._parser().parse(Deno.readTextFileSync(filePath)) as Item; // TODO: Is this a naughty cast?
    }
    throw new Error(`Unknown type of entity: ${entityType}`);
  }
  store(key: string, value: any): Promise<void> {
    const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
    let sessionContents = { Variables: {} as StringToStringMap };
    if (existsSync(sessionPath)) {
      sessionContents = this._parser().parse(Deno.readTextFileSync(sessionPath));
    }
    sessionContents.Variables[key] = value;
    Deno.writeTextFileSync(sessionPath, this._parser().stringify(sessionContents));
    return Promise.resolve();
  }
  _parser(): Parser {
    return Parsers[this.fileExtension.toUpperCase()];
  }
  _load(theRequest: Request, resourceName: string, environmentName: string): void {
    const defaultFilePaths = getDefaultFilePaths(resourceName, this.fileExtension, environmentName);
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = this._parser().parse(Deno.readTextFileSync(defaultFilePath));
        checkForbidden(fileContents);
        applyChanges(theRequest, fileContents);
      }
    }
    const filePath = resourceName + "." + this.fileExtension; // TODO: collection
    const fileContents = this._parser().parse(Deno.readTextFileSync(filePath));
    checkRequired(fileContents);
    applyChanges(theRequest, fileContents);
    const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
    if (existsSync(sessionPath)) {
      const sessionContents = this._parser().parse(Deno.readTextFileSync(sessionPath));
      applyChanges(theRequest, sessionContents);
    }
  }
}

const DEFAULT_MARKER = "defaults";
function filetypeSupported(filePath: string): boolean {
  const fileExtension = filePath.substring(filePath.lastIndexOf(".") + 1);
  return Parsers[fileExtension.toUpperCase()] !== undefined;
}
function getDefaultsFilePath(folderPath: string, fileExtension: string): string {
  return `${folderPath}/${DEFAULT_MARKER}.${fileExtension}`;
}
function excludeFromInfo(name: string): boolean {
  return name.startsWith(`${DEFAULT_MARKER}.`);
}
// TODO: Exported should be taken away ASAP
export async function determineType(entityName: string): Promise<EntityType> {
  if (entityName.startsWith(getDirectoryForEntity(EntityType.Authorization))) {
    return EntityType.Authorization;
  }
  if (entityName.startsWith(getDirectoryForEntity(EntityType.Environment))) {
    return EntityType.Environment;
  }
  if (existsSync(entityName, { isFile: true })) {
    return EntityType.Request;
  } else if (entityName.includes("/")) {
    return EntityType.Folder;
  } else {
    return EntityType.Collection;
  }
}
function getDirectoryForEntity(entityType: EntityType): string {
  switch (entityType) {
    case EntityType.Environment:
      return "environments";
    case EntityType.Authorization:
      return "authorizations";
    default:
      throw new Error(`Unknown entity type ${EntityType[entityType]}`);
  }
}
function getEnvironmentPath(environmentName: string, fileExtension: string): string {
  return getDirectoryForEntity(EntityType.Environment) + `/${environmentName}.${fileExtension}`;
}
function getDefaultFilePaths(requestFilePath: string, fileExtension: string, environmentName: string): string[] {
  const defaultEnvironments = ["globals.local", "globals", `${environmentName}.local`, environmentName].map((name) => getEnvironmentPath(name, fileExtension));
  const defaultFilePaths = [];
  let currentDirectory = dirname(requestFilePath);
  while (currentDirectory !== "." && currentDirectory !== "") {
    defaultFilePaths.push(getDefaultsFilePath(currentDirectory + "/" + currentDirectory, fileExtension));
    currentDirectory = dirname(currentDirectory);
  }
  return [...defaultEnvironments, ...defaultFilePaths.reverse()];
}
function applyChanges(destination: any, source: any): void {
  if (!source) {
    return;
  }
  for (const key of Object.keys(source)) {
    if (destination[key] !== undefined && typeof destination[key] === "object") {
      applyChanges(destination[key], source[key]);
    } else {
      destination[key] = source[key];
    }
  }
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
