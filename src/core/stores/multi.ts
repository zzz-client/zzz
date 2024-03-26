import DI from "../di.ts";
import { Trace } from "../etc.ts";
import { Scope } from "../modules/scope/mod.ts";
import { IStore, Model, SearchParams } from "../storage/mod.ts";
import FileStore from "./files.ts";

export default class MultiStore implements IStore {
  private stores = new Map<string | undefined, IStore>();
  constructor(stores?: string[]) {
    if (!stores || stores.length === 0) {
      this.stores.set(
        undefined,
        new FileStore({
          location: ".",
          fileFormat: "yml",
        }),
      );
    } else {
      for (const store of stores) {
        this.stores.set(
          store,
          new FileStore({
            location: store,
            fileFormat: "yml",
          }),
        );
      }
    }
  }
  async getModelType(id: string, store?: string): Promise<string> {
    this.checkHaveStore(store);
    Trace(`MultiStore: Getting model type for ID: ${id}`);
    return await this.stores.get(store)!.getModelType(id);
  }
  async get(modelType: string, id: string, store?: string): Promise<Model> {
    this.checkHaveStore(store);
    Trace(`MultiStore: Getting model of type ${modelType}, id ${id}`);
    return await this.stores.get(store)!.get(modelType, id) as Model;
  }
  async set(modelType: string, model: Model, store?: string): Promise<void> {
    this.checkHaveStore(store);
    await this.stores.get(store)!.set(modelType, model);
    if (modelType === Scope.name) {
      this.addStore(store);
    }
  }
  async remove(modelType: string, id: string, store?: string): Promise<void> {
    this.checkHaveStore(store);
    await this.stores.get(store)!.remove(modelType, id);
  }
  async list(modelType: string, store?: string): Promise<Model[]> {
    this.checkHaveStore(store);
    return await this.stores.get(store)!.list(modelType);
  }
  async search(searchParams: SearchParams, store?: string): Promise<Model[]> {
    this.checkHaveStore(store);
    let result = [] as Model[];
    for (const name of this.stores.keys()) {
      const searchResults = await this.stores.get(name)!.search(searchParams);
      result = [...result, ...searchResults];
    }
    return result;
  }
  move(modelType: string, oldId: string, newId: string, store?: string): Promise<void> {
    this.checkHaveStore(store);
    return this.stores.get(store)!.move(modelType, oldId, newId);
  }
  private addStore(store: string | undefined): void {
    if (!this.stores.get(store)) {
      this.stores.set(store, DI.newInstance("IStore") as IStore);
    }
  }
  private checkHaveStore(store?: string): void {
    if (store === undefined && !this.stores.has(store)) {
      if (this.stores.size > 0) {
        throw new DefaultStoreNotAllowedError("Default store not allowed because there are one or more stores already set: " + this.stores.keys());
      }
      this.stores.set(
        store,
        new FileStore({
          location: ".",
          fileFormat: "yml",
        }),
      );
    }
    if (this.stores.get(store) === undefined) {
      throw new MissingStoreError(store);
    }
  }
}

export class MissingStoreError extends Error {
  constructor(scope: string | undefined) {
    super(`Unknown Scope: ${scope}`);
  }
}
export class DefaultStoreNotAllowedError extends Error {
}

// ----------------------------------------- TESTS -----------------------------------------
