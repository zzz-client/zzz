export class Model {
  Id!: string;
  Name!: string;
}
export interface ParentModel extends Model {
  Children: Model[];
}
export type SearchParams = string;

export interface IStorage {
  has(id: string): Promise<boolean>;
  get(id: string): Promise<Model>;
  put(model: Model): Promise<void>;
  delete(id: string): Promise<void>;
  move(oldId: string, newId: string): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
}

export interface IStore {
  get(modelType: string, id: string): Promise<Model>;
  set(modelType: string, model: Model): Promise<void>;
  move(modelType: string, oldId: string, newId: string): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
  list(modelType: string): Promise<Model[]>;
  getModelType(id: string): Promise<string>;
}
