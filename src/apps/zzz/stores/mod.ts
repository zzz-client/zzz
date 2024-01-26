import { DIable } from "../../../lib/di.ts";
import { Model, SearchParams } from "../../../storage/mod.ts";

export interface IStore extends DIable {
  get(modelType: string, id: string): Promise<Model>;
  set(modelType: string, model: Model): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
  list(modelType: string): Promise<Model[]>;
}
