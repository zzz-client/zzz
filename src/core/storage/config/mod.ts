import { extname } from "../../deps.ts";
import { IStorage, Model, SearchParams } from "../mod.ts";
import { getFileFormat } from "../files/formats.ts";
import FileStorage from "../files/mod.ts";

interface StringToStringListMap {
  [key: string]: string[];
}

export default class ConfigStorage implements IStorage {
  private itemExtension: string;
  private configContents: StringToStringListMap;
  constructor(filePath: string, itemExtension: string) {
    const fileExt = extname(filePath);
    const configFileContents = Deno.readTextFileSync(filePath);
    this.configContents = getFileFormat(fileExt).parse(configFileContents);
    this.itemExtension = itemExtension;
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
}

// ----------------------------------------- TESTS -----------------------------------------

// import { describe, it } from "../../tests.ts";
