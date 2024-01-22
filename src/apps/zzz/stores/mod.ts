import { Model, SearchParams } from "../../../storage/mod.ts";
import { Context } from "../modules/context/mod.ts";

export interface IStore {
  get(modelType: string, id: string): Promise<Model>;
  set(model: Model): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
}
