import ZzzRequest, { Collection } from "./request.ts";
import { IStore, newStore, Stats } from "./factories.ts";
import FileStore, { Parsers } from "./stores/file.ts";
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
  YML: new FileStore("yml") as unknown as IStore,
  YAML: new FileStore("yml") as unknown as IStore,
  XML: new FileStore("xml") as unknown as IStore,
  Postman: new PostmanStore("PostmanCollection.json") as unknown as IStore,
} as StoreMap;
export async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["REST API"];
  for (const collection of collections) {
    result.push(await Get(EntityType.Collection, collection, "Integrate")); // TODO: Hardcoded
  }
  return result;
}
export default function Store(key: string, value: string, environmentName: string): any {
  return newStore().store(key, value, environmentName);
}
export async function Get(entityType: EntityType, entityName: string, environmentName: string): Promise<any> {
  const theRequest = await newStore().get(entityType, entityName, environmentName);
  if (entityType === EntityType.Request) {
    loadBody(theRequest, entityName);
  }
  return theRequest;
}
export async function Stat(entityName: string): Promise<Stats> {
  return newStore().stat(entityName);
}
function loadBody(theRequest: ZzzRequest, _requestFilePath: string) {
  if (typeof theRequest.Body === "string") {
    theRequest.Body = Parsers.JSON.parse(theRequest.Body);
  }
  if (!theRequest.Body) {
    theRequest.Body = null;
  }
}
