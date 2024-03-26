import { Trace } from "../etc.ts";
import { IStorage, IStore, Model, SearchParams } from "../storage/mod.ts";
import { Authorization } from "../modules/auth/mod.ts";
import { Context } from "../modules/context/mod.ts";
import { Cookies } from "../modules/cookies/mod.ts";
import { Collection, HttpRequest } from "../modules/requests/mod.ts";
import { Scope } from "../modules/scope/mod.ts";
import FileStorage from "../storage/files/mod.ts";

const DEFAULT_SCOPE = "library"; // TODO: How the hell can this be dynamic

interface FileStoreParams {
  location: string;
  fileFormat: string;
}

export default class FileStore implements IStore {
  private storages = new Map<string, IStorage>();
  constructor(params: FileStoreParams) {
    Trace("Constructing FileStore with params", params);
    this.addStorage(HttpRequest.name, new FileStorage(params.location, params.fileFormat));
    this.addStorage(Collection.name, new FileStorage(params.location, params.fileFormat));
    this.addStorage(Scope.name, new FileStorage(params.location, params.fileFormat));
    this.addStorage(Authorization.name, new FileStorage(params.location + "/_auth", params.fileFormat));
    this.addStorage(Context.name, new FileStorage(params.location + "/_contexts", params.fileFormat));
    this.addStorage(Cookies.name, new FileStorage(params.location + "/_cookies", params.fileFormat));
  }
  addStorage(modelType: string, storage: IStorage): void {
    this.storages.set(modelType, storage);
  }
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
    Trace(`FileStore: Getting model of type ${modelType}, id ${id}`);
    const result = await this.storage(modelType).retrieve(id) as Model;
    Trace("FileStore: got", result);
    return result;
  }
  async set(modelType: string, model: Model): Promise<void> {
    await this.storage(modelType).save(model);
  }
  async remove(modelType: string, id: string): Promise<void> {
    await this.storage(modelType).delete(id);
  }
  async list(modelType: string): Promise<Model[]> {
    if (modelType === Scope.name) {
      return [await this.get(Scope.name, DEFAULT_SCOPE)];
    }
    Trace("Listing " + modelType);
    const result = await this.storage(modelType).list();
    Trace("List results: " + result);
    return result;
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
