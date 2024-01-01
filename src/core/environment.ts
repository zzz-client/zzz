import { EntityType } from "./storage.ts";
import { DEFAULT_MARKER, getDirectoryForEntity } from "./stores/file.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";

interface IEnvironment {
  load(environmentName: string): Promise<any>;
}

class FileEnvironment implements IEnvironment {
  load(environmentName: string): Promise<any> {
    const defaultFilePaths = getDefaultFilePaths(resourceName, this.fileExtension, environmentName);
    for (const defaultFilePath of defaultFilePaths) {
      if (existsSync(defaultFilePath)) {
        const fileContents = this._parser().parse(Deno.readTextFileSync(defaultFilePath));
        checkForbidden(fileContents);
        applyChanges(theRequest, fileContents);
      }
    }
    const filePath = resourceName + "." + this.fileExtension;
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

export function applyChanges(destination: any, source: any): void {
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
export function getEnvironmentPath(environmentName: string, fileExtension: string): string {
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
function getDefaultsFilePath(folderPath: string, fileExtension: string): string {
  return `${folderPath}/${DEFAULT_MARKER}.${fileExtension}`;
}
