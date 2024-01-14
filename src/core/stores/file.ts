import { existsSync } from "https://deno.land/std/fs/mod.ts";
import ZzzRequest, { Collection, Folder, Item, StringToStringMap } from "../models.ts";
import { EntityType, Stores } from "../storage.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import { parse as yamlParse, stringify as yamlStringify } from "https://deno.land/std/yaml/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml/mod.ts";
const xmlStringify = (x: any) => Deno.exit(1);
import { IStore, Stats } from "../factories.ts";
import { getEnvironmentPath, Load, Meld } from "../variables.ts";
export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async stat(entityId: string): Promise<Stats> {
    const filePath = existsSync(entityId, { isDirectory: true }) ? entityId : `${entityId}.${this.fileExtension}`;
    const entType = await determineType(filePath);
    const file = await Deno.stat(filePath);
    const stats = {
      Type: EntityType[entType],
      Name: entityId,
      Created: file.birthtime!,
      Modified: file.mtime!,
    } as Stats;
    return stats;
  }
  async get(entityType: EntityType, entityId: string, environmentName: string): Promise<Item> {
    if (entityType === EntityType.Request) {
      const requestPath = entityId + "." + this.fileExtension;
      const resultRequest = Parsers.YAML.parse(Deno.readTextFileSync(requestPath)) as ZzzRequest;
      resultRequest.Id = entityId;
      resultRequest.Type = EntityType[entityType];
      if (!resultRequest.Name) {
        resultRequest.Name = basename(entityId);
      }
      return resultRequest;
    } else if (entityType === EntityType.Collection || entityType === EntityType.Folder) {
      const item = new (entityType === EntityType.Collection ? Collection : Folder)(entityId, basename(entityId));
      for await (const child of Deno.readDir(entityId)) {
        if (child.isDirectory) {
          item.Children.push(await this.get(EntityType.Folder, `${entityId}/${child.name}`, environmentName));
        } else if (child.isFile && filetypeSupported(child.name) && !excludeFromInfo(child.name)) {
          const baseless = basename(child.name, extname(child.name));
          item.Children.push(await this.get(EntityType.Request, `${entityId}/${baseless}`, environmentName));
        }
      }
      item.Id = entityId;
      item.Type = EntityType[entityType];
      return item;
    }
    if (entityType === EntityType.Environment || entityType === EntityType.Authorization) {
      const entityFolder = getDirectoryForEntity(entityType);
      const filePath = `${entityFolder}/${entityId}.${this.fileExtension}`;
      const item = this._parser().parse(Deno.readTextFileSync(filePath)) as Item;
      item.Id = entityId;
      item.Type = EntityType[entityType];
      return 
    }
    throw new Error(`Unknown type of entity: ${entityType}`);
  }
  store(key: string, value: any): Promise<void> {
    const sessionPath = getEnvironmentPath(SESSION_FILE, this.fileExtension);
    let sessionContents = { Variables: {} as StringToStringMap };
    if (existsSync(sessionPath)) {
      sessionContents = this._parser().parse(Deno.readTextFileSync(sessionPath));
    }
    sessionContents.Variables[key] = value;
    Deno.writeTextFileSync(sessionPath, this._parser().stringify(sessionContents));
    return Promise.resolve();
  }
  setEnvironment(environmentName: string): void {
    throw new Error("Not implemented");
  }
  _parser(): Parser {
    return Parsers[this.fileExtension.toUpperCase()];
  }
}

function filetypeSupported(filePath: string): boolean {
  const fileExtension = filePath.substring(filePath.lastIndexOf(".") + 1);
  return Parsers[fileExtension.toUpperCase()] !== undefined;
}
function excludeFromInfo(name: string): boolean {
  return name.startsWith("_");
}
async function determineType(entityId: string): Promise<EntityType> {
  if (entityId.startsWith(getDirectoryForEntity(EntityType.Authorization))) {
    return EntityType.Authorization;
  }
  if (entityId.startsWith(getDirectoryForEntity(EntityType.Environment))) {
    return EntityType.Environment;
  }
  if (existsSync(entityId, { isFile: true })) {
    return EntityType.Request;
  } else if (entityId.includes("/")) {
    return EntityType.Folder;
  } else {
    return EntityType.Collection;
  }
}
export function getDirectoryForEntity(entityType: EntityType): string {
  switch (entityType) {
    case EntityType.Environment:
      return "environments";
    case EntityType.Authorization:
      return "authorizations";
    default:
      throw new Error(`Unknown entity type ${EntityType[entityType]}`);
  }
}

// TODO: This should be private eventually I believe
export type Parser = {
  parse: (input: string) => any;
  stringify: (input: any) => string;
};
export const Parsers = {
  YAML: { parse: yamlParse, stringify: yamlStringify },
  YML: { parse: yamlParse, stringify: yamlStringify },
  XML: { parse: xmlParse, stringify: xmlStringify },
  JSON: { parse: JSON.parse, stringify: (s: any) => JSON.stringify(s, null, 2) },
  TEXT: {
    parse: (input: string) => input + "",
    stringify: (input: any) => input + "",
  },
} as { [key: string]: Parser };
