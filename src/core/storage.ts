import { Parsers } from "./render.ts";
import ZzzRequest, { Collection } from "./request.ts";
import { newStore, Stats } from "./factories.ts";
import FileStore from "./stores/file.ts";
import PostmanStore from "./stores/postman.ts";

export enum EntityType {
  Authorization,
  Environment,
  Request,
  Folder,
  Collection,
}
export const Stores = {
  JSON: new FileStore("json"),
  YAML: new FileStore("yml") as IStore,
  XML: new FileStore("xml"),
  Postman: new PostmanStore("PostmanCollection.json"),
};
export async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["REST API"]; // TODO: Hardcoded
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
    theRequest.Body = Parsers.JSON.parse(theRequest.Body); // TODO: Different for different types?
  }
  if (!theRequest.Body) {
    theRequest.Body = null;
  }
}
