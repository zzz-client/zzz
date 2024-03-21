import { basename, exists, extname, join } from "../../deps.ts";
import { asAny, Meld, StringToStringMap, Trace } from "../../etc.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../mod.ts";
import { getFileFormat } from "../files/formats.ts";

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
  async has(id: string): Promise<boolean> {
    for (const key in this.configContents) {
      for (const value of this.configContents[key]) {
        if (value === id) {
          return true;
        }
      }
    }
    return false;
  }
  async retrieve(fullId: string): Promise<Model> {
    return new FileStorage("", this.itemExtension).retrieve(fullId);
  }
  rename(_oldId: string, _newId: string): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  async save(model: Model): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  async delete(id: string): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  search(_searchParams: SearchParams): Promise<Model[]> {
    throw new Error("Not implemented");
  }
  move(): Promise<void> {
    throw new Error("Config storage is read only.");
  }
  async list(directory: string): Promise<Model[]> {
    const what = this.configContents[directory];
    return what.map((value) => {
      return { Id: value, Name: value } as Model;
    });
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "../../tests.ts";
import FileStorage from "../files/mod.ts";
import FileStore from "../../stores/files.ts";
