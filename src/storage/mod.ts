export class Model {
  Id!: string;
  Name!: string;
}
export interface ParentModel extends Model {
  Children: Model[];
}
export type SearchParams = string;

export interface IStorage {
  get(id: string): Promise<Model>;
  set(id: string, model: Model): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
}
