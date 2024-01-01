import { Parsers } from "./render.ts";
import ZzzRequest, { Collection } from "./request.ts";
import { IStore, newStore, Stats } from "./factories.ts";
import FileStore from "./stores/file.ts";
import PostmanStore from "./stores/postman.ts";

export enum EntityType {
  Authorization,
  Environment,
  Request,
  Folder,
  Collection,
}

interface StoreMap {
  [key: string]: IStore;
}
export const Stores = { // TODO: Why do I have to do this dirty casting
  JSON: new FileStore("json") as unknown as IStore,
  YAML: new FileStore("yml") as unknown as IStore,
  XML: new FileStore("xml") as unknown as IStore,
  Postman: new PostmanStore("PostmanCollection.json") as unknown as IStore,
} as StoreMap;
export async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["REST API"];
  for (const collection of collections) {
    result.push(await Get(EntityType.Collection, collection, null));
  }
  return result;
}
export default function Store(key: string, value: string, environmentName: string): any {
  return newStore(environmentName).store(key, value);
}
export async function Get(entityType: EntityType, entityName: string, environmentName: string | null): Promise<any> {
  const theRequest = await newStore(environmentName).get(entityType, entityName);
  if (entityType === EntityType.Request) {
    loadBody(theRequest, entityName);
  }
  return theRequest;
}
export async function Stat(itemName: string): Promise<Stats> {
  return newStore().stat(itemName);
}
function loadBody(theRequest: ZzzRequest, _requestFilePath: string) {
  if (typeof theRequest.Body === "string") {
    theRequest.Body = Parsers.JSON.parse(theRequest.Body);
  }
  if (!theRequest.Body) {
    theRequest.Body = null;
  }
}
