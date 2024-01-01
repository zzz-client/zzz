import { existsSync } from "https://deno.land/std/fs/mod.ts";
import ZzzRequest, { Collection, Folder, Item, StringToStringMap } from "../request.ts";
import { EntityType } from "../storage.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import { parse as yamlParse, stringify as yamlStringify } from "https://deno.land/std/yaml/mod.ts";
import { parse as xmlParse } from "https://deno.land/x/xml/mod.ts";
const xmlStringify = (x: any) => Deno.exit(1);
import { IStore, Stats } from "../factories.ts";
import { getEnvironmentPath, Load, Meld } from "../variables.ts";

const SESSION_FILE = "session.local";

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async stat(entityName: string): Promise<Stats> {
    const filePath = existsSync(entityName, { isDirectory: true }) ? entityName : `${entityName}.${this.fileExtension}`;
    const entType = await determineType(filePath);
    const file = await Deno.stat(filePath);
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
      const theRequest = new ZzzRequest("", "", ""); // TODO: Is this hacky?
      console.log("Pre-pre-meld", dirname(entityName));
      const meldedDefaults = await Load(dirname(entityName), environmentName, this.fileExtension);
      console.log("Pre-meld", theRequest.URL);
      Meld(theRequest, meldedDefaults);
      // Meld actual request?
      console.log("Post-meld", theRequest.URL);
      if (!theRequest.Name) {
        theRequest.Name = basename(entityName);
      }
      return theRequest;
    } else if (entityType === EntityType.Collection || entityType === EntityType.Folder) {
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
async function determineType(entityName: string): Promise<EntityType> {
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
