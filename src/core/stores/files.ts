import DI from "../di.ts";
import { asAny, Trace } from "../etc.ts";
import { IStorage, IStore, Model, ParentModel, SearchParams } from "../storage/mod.ts";
import { Authorization } from "../modules/auth/mod.ts";
import { Context } from "../modules/context/mod.ts";
import { Cookies } from "../modules/cookies/mod.ts";
import { Collection, HttpRequest } from "../modules/requests/mod.ts";
// import { Scope } from "../modules/scope/mod.ts";

export default class FileStore implements IStore {
  private FILE_FORMAT = "yml";
  // deno-fmt-ignore
  private storages: Map<string, IStorage> = new Map([
    [HttpRequest.name,        DI.newInstance("IStorage:HttpRequest",    ["library", this.FILE_FORMAT]) as IStorage],
    [Scope.name,              DI.newInstance("IStorage:Scope",          ["library", this.FILE_FORMAT]) as IStorage],
    [Collection.name,         DI.newInstance("IStorage:Collection",     ["library", this.FILE_FORMAT]) as IStorage],
    [Context.name,            DI.newInstance("IStorage:Context",        ["library/contexts", this.FILE_FORMAT]) as IStorage],
    [Authorization.name,      DI.newInstance("IStorage:Authorization",  ["library/auth", this.FILE_FORMAT]) as IStorage],
    [Cookies.name,            DI.newInstance("IStorage:Cookies",        ["library/cookies", this.FILE_FORMAT]) as IStorage],
  ]);
  async getModelType(id: string): Promise<string> {
    Trace(`FileStore: Getting model type for ID: ${id}`);
    for (const modelType of this.storages.keys()) {
      if (await this.storages.get(modelType)!.has(id)) {
        return modelType;
      }
    }
    throw new Error("Unable to determine model type for ID: " + id);
  }
  async get(modelType: string, id: string): Promise<Model> {
    Trace(`FileStore: Getting model type ${modelType} id ${id}`);
    const result = await this.storage(modelType).retrieve(id) as Model;
    Trace("FileStore: got", result);
    return result;
  }
  async set(modelType: string, model: Model): Promise<void> {
    await this.storage(modelType).put(model);
  }
  async remove(modelType: string, id: string): Promise<void> {
    await this.storage(modelType).delete(id);
  }
  async list(modelType: string): Promise<Model[]> {
    const result = await this.storage(modelType).retrieve(".");
    const children = asAny(result as ParentModel).Children;
    // if (modelType === Scope.name) {
    //   const baseDirs = Array.from(this.storages.values())
    //     .map((storage: IStorage) => storage.baseDir)
    //     .filter((dir: string) => dir.startsWith(this.storages.get(HttpRequest.name).baseDir + "/"))
    //     .map((dir: string) => dir.substring((this.storages.get(HttpRequest.name).baseDir + "/").length));
    //   console.log("baseDirs", baseDirs);
    //   children = children.filter((child: Model) => {
    //     return !baseDirs.includes(child.Id);
    //   });
    // }
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
  move(modelType: string, oldId: string, newId: string): Promise<void> {
    return this.storages.get(modelType)!.rename(oldId, newId);
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

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "../tests.ts";
import { Scope } from "../modules/scope/mod.ts";

describe("FileStore", () => {
  describe("getModelType", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("get", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("set", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("list", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("search", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("move", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("storage", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
});