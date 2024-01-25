import { basename } from "https://deno.land/std/path/mod.ts";
import { Trace } from "../../../lib/lib.ts";
import FileStorage from "../../../storage/files/mod.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../../../storage/mod.ts";
import { Authorization } from "../modules/auth/mod.ts";
import { Context } from "../modules/context/mod.ts";
import { Cookies } from "../modules/cookies/mod.ts";
import { Collection, HttpRequest } from "../modules/requests/mod.ts";
import { Scope } from "../modules/scope/mod.ts";
import { IStore } from "./mod.ts";

export default class FileStore implements IStore {
  private FILE_FORMAT = "yml;";
  private storages: Map<string, IStorage> = new Map([
    [HttpRequest.name, new FileStorage("requests", this.FILE_FORMAT)],
    [Scope.name, new FileStorage("requests", this.FILE_FORMAT)],
    [Collection.name, new FileStorage("requests", this.FILE_FORMAT)],
    [Context.name, new FileStorage("contexts", this.FILE_FORMAT)],
    [Authorization.name, new FileStorage("auth", this.FILE_FORMAT)],
    [Cookies.name, new FileStorage("cookies", this.FILE_FORMAT)],
  ]);
  async get(modelType: string, id: string): Promise<Model> {
    Trace(`FileStore: Getting model type ${modelType} id ${id}`);
    const result = await this.storage(modelType).get(id) as Model;
    result.Id = id;
    if (!result.Name) { // TODO: Why is this not working when --all is passed
      result.Name = basename(id);
    }
    return result;
  }
  async set(modelType: string, model: Model): Promise<void> {
    await this.storage(modelType).set(modelType, model);
  }
  async list(modelType: string): Promise<Model[]> {
    const result = await this.storage(modelType).get(".");
    const children = (result as ParentModel).Children;
    return children;
  }
  async search(searchParams: SearchParams): Promise<Model[]> {
    let result = [] as Model[];
    for (const modelType of this.storages.keys()) {
      const searchResults = await this.storage(modelType).search(searchParams);
      result = [...result, ...searchResults];
    }
    return result;
  }
  private storage(modelName: string): IStorage {
    if (!this.storages.get(modelName)) {
      throw new Error("Unknown Model type: " + modelName);
    }
    return this.storages.get(modelName)!;
  }
}

// private NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
// }
// function checkForbidden(modelContents: any): void {
//   for (const key of this.NO_DEFAULT_ALLOWED) {
//     if (modelContents[key]) {
//       throw new Error(`Forbidden key ${key}`);
//     }
//   }
