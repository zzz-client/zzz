import { dirname, exists, extname, PATH_SEPARATOR, resolvePath } from "../../deps.ts";
import { IStorage, Model, SearchParams } from "../mod.ts";
import { formatsByExtension, getFileFormat } from "../files/formats.ts";
import FileStorage from "../files/mod.ts";

interface StringToStringListMap {
  [key: string]: string[];
}

export default class ConfigStorage implements IStorage {
  private itemExtension: string;
  private configContents!: StringToStringListMap;
  constructor(filename: string, itemExtension: string) {
    this.itemExtension = itemExtension;
    resolveScopeDir().then((rootDir) => {
      const fileExt = extname(filename);
      const configFileContents = Deno.readTextFileSync(`${rootDir}${PATH_SEPARATOR}${filename}`);
      this.configContents = getFileFormat(fileExt).parse(configFileContents);
    });
  }
  has(id: string): Promise<boolean> {
    for (const key in this.configContents) {
      for (const value of this.configContents[key]) {
        if (value === id) {
          return Promise.resolve(true);
        }
      }
    }
    return Promise.resolve(false);
  }
  retrieve(fullId: string): Promise<Model> {
    return new FileStorage("", this.itemExtension).retrieve(fullId);
  }
  rename(_oldId: string, _newId: string): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  save(_model: Model): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  delete(_id: string): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  search(_searchParams: SearchParams): Promise<Model[]> {
    throw new Error("Not implemented");
  }
  move(): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  list(directory: string): Promise<Model[]> {
    const what = this.configContents[directory];
    return Promise.resolve(what.map((value) => {
      return { Id: value, Name: value } as Model;
    }));
  }
  setScope(scope: string): void {
    this.scope = scope;
  }
}

export async function resolveScopeDir(): Promise<string> {
  let currentPath = ".";
  while (await exists(currentPath)) {
    for (const fileExt in formatsByExtension) {
      if (await exists(`${currentPath}${PATH_SEPARATOR}zzz.${fileExt}`)) {
        return Promise.resolve(currentPath);
      }
    }
    currentPath = dirname(resolvePath(currentPath));
  }
  console.log("uh oh pasghettios");
  return Promise.reject(`Not in a Zzz directory`);
}

// ----------------------------------------- TESTS -----------------------------------------

// import { describe, it } from "../../tests.ts";
