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
    result.push(await Get(EntityType.Collection, collection, "integrate")); // TODO: Hardcoded
  }
  return result;
}
export default function Store(key: string, value: string, environmentName: string): any {
  return newStore().store(key, value, environmentName);
}
export async function Get(entityType: EntityType, entityId: string, environmentName: string): Promise<any> {
  const theRequest = await newStore().get(entityType, entityId, environmentName);

  if (entityType === EntityType.Request) {
    loadBody(theRequest, entityId);
    checkRequired(theRequest);
  }
  return theRequest;
}
const REQUIRED_ON_REQUEST = ["Method", "URL"];
function checkRequired(fileContents: any): void {
  for (const key of REQUIRED_ON_REQUEST) {
    if (!fileContents[key]) {
      throw new Error(`Missing required key ${key}`);
    }
  }
}
export async function Stat(entityId: string): Promise<Stats> {
  return newStore().stat(entityId);
}
function loadBody(theRequest: ZzzRequest, _requestFilePath: string) {
  if (typeof theRequest.Body === "string") {
    theRequest.Body = Parsers.JSON.parse(theRequest.Body);
  }
  if (!theRequest.Body) {
    theRequest.Body = null;
  }
}
