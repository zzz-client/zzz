import { Model, SearchParams } from "../../../storage/mod.ts";

export interface IStore {
  get(modelType: string, id: string): Promise<Model>;
  set(modelType: string, model: Model): Promise<void>;
  move(modelType: string, oldId: string, newId: string): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
  list(modelType: string): Promise<Model[]>;
}
