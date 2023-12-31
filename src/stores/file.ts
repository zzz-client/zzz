import Request, { Collection, Folder, Item, StringToStringMap } from "../request.ts";
import { EntityType, Get, IStore } from "../store.ts";
import { dirname, existsSync, Parser, Parsers, readTextFileSync, writeTextFileSync } from "../libs.ts";

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  parser(): Parser {
    return Parsers[this.fileExtension.toUpperCase()];
  }
  get(entityType: EntityType, entityName: string, environmentName: string): Promise<any> {
    if (entityType === EntityType.Request) {
      const theRequest = new Request("", "", ""); // TODO: Is this hacky?
      this._load(theRequest, entityName, environmentName);
      return Promise.resolve(theRequest);
    }
    if (entityType == EntityType.Collection || entityType == EntityType.Folder) {
      return getInfo(entityType, entityName, environmentName);
    }
    if (entityType == EntityType.Environment || entityType == EntityType.Authorization) {
      const entityFolder = getDirectoryForEntity(entityType);
      const filePath = `${entityFolder}/${entityName}.${this.fileExtension}`;
      return this.parser().parse(readTextFileSync(filePath));
    }
    throw new Error(`Unknown type of entity: ${entityType}`);
  }
  store(key: string, value: any): Promise<void> {
    const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
    let sessionContents = { Variables: {} as StringToStringMap };
    if (existsSync(sessionPath)) {
      sessionContents = this.parser().parse(readTextFileSync(sessionPath));
    }
    sessionContents.Variables[key] = value;
    writeTextFileSync(sessionPath, this.parser().stringify(sessionContents));
    return Promise.resolve();
  }
  _load(theRequest: Request, resourceName: string, environmentName: string): void {
    const defaultFilePaths = getDefaultFilePaths(resourceName, this.fileExtension, environmentName); // TODO: collection
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = this.parser().parse(readTextFileSync(defaultFilePath));
        checkForbidden(fileContents);
        applyChanges(theRequest, fileContents);
      }
    }
    const X = resourceName + "." + this.fileExtension; // TODO: collection
    console.log("X", X);
    const fileContents = this.parser().parse(readTextFileSync(X));
    console.log(fileContents);
    checkRequired(fileContents);
    applyChanges(theRequest, fileContents);
    const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
    if (existsSync(sessionPath)) {
      const sessionContents = this.parser().parse(readTextFileSync(sessionPath));
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
async function getInfo(entityType: EntityType, entityName: string, environmentName: string): Promise<Item> {
  const item = entityType === EntityType.Collection ? new Collection(entityName) : new Folder(entityName);
  const children = await Deno.readDirSync(entityName); // TODO: libs
  for (const child of children) {
    console.log("Child", child);
    if (child.isDirectory) {
      item.Children.push(await Get(EntityType.Folder, entityName + "/" + child.name, environmentName));
    }
    if (child.isFile) {
      if (!excludeFromInfo(child.name) && filetypeSupported(child.name)) {
        const extensionlessName = child.name.substring(0, child.name.lastIndexOf("."));
        item.Children.push(await Get(EntityType.Request, entityName + "/" + extensionlessName, environmentName));
      }
    }
  }
  return item;
}
function getDirectoryForEntity(entityType: EntityType): string {
  switch (entityType) {
    case EntityType.Environment:
      return "environments";
    case EntityType.Authorization:
      return "authorizations";
    default:
      throw `Unknown entity type ${entityType}`;
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
