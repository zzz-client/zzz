import Request, { AnyNonPromise, StringToStringMap } from "../request.ts";
import { EntityType, IStore } from "../store.ts";
import { dirname, existsSync, Parser, Parsers, readTextFileSync, writeTextFileSync } from "../libs.ts";

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  parser(): Parser {
    return Parsers[this.fileExtension.toUpperCase()];
  }
  get<T>(entityType: EntityType, entityName: string, environmentName: string): Promise<AnyNonPromise<T>> {
    if (entityType === EntityType.Request) {
      const theRequest = new Request();
      this.load(theRequest, entityName, environmentName);
      return Promise.resolve(theRequest);
    } else {
      const entityFolder = getDirectoryForEntity(entityType);
      const filePath = `${entityFolder}/${entityName}.${this.fileExtension}`;
      return this.parser().parse(readTextFileSync(filePath));
    }
  }
  store<T>(key: string, value: any): Promise<void> {
    const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
    let sessionContents = { Variables: {} as StringToStringMap };
    if (existsSync(sessionPath)) {
      sessionContents = this.parser().parse(readTextFileSync(sessionPath));
    }
    sessionContents.Variables[key] = value;
    writeTextFileSync(sessionPath, this.parser().stringify(sessionContents));
    return Promise.resolve();
  }
  load(theRequest: Request, requestId: string, environmentName: string): void {
    const defaultFilePaths = getDefaultFilePaths("requests/" + requestId, this.fileExtension, environmentName);
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = this.parser().parse(readTextFileSync(defaultFilePath));
        checkForbidden(fileContents);
        applyChanges(theRequest, fileContents);
      }
    }
    const X = "requests/" + requestId + "." + this.fileExtension; // TODO: What
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
function getDirectoryForEntity(entityType: EntityType): string {
  switch (entityType) {
    case EntityType.Request:
      return "requests";
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
    defaultFilePaths.push(`${currentDirectory}/defaults.${fileExtension}`);
    currentDirectory = dirname(currentDirectory);
  }
  return [...defaultEnvironments, ...defaultFilePaths.reverse()];
}
function applyChanges<T>(destination: any, source: any): void {
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
