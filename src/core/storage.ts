import { Parsers } from "./render.ts";
import Request, { Collection } from "./request.ts";
import { newStore, Stats } from "./factories.ts";

export enum EntityType {
  Authorization,
  Environment,
  Request,
  Folder,
  Collection,
}
export async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["REST API"]; // TODO: Hardcoded
  for (const collection of collections) {
    result.push(await Get(EntityType.Collection, collection, null));
  }
  return result;
}
export default function Store(key: string, value: string, environmentName: string): any {
  return newStore().store(key, value, environmentName);
}
export async function Get(entityType: EntityType, entityName: string, environmentName: string | null): Promise<any> {
  const theRequest = await newStore().get(entityType, entityName, environmentName);
  if (entityType === EntityType.Request) {
    loadBody(theRequest, entityName, environmentName);
  }
  return theRequest;
}
export async function Stat(itemName: string): Promise<Stats> {
  return newStore().stat(itemName);
}
function loadBody(theRequest: Request, _requestFilePath: string, _environmentName: string | null) {
  if (typeof theRequest.Body === "string") {
    theRequest.Body = Parsers.JSON.parse(theRequest.Body); // TODO: Different for different types?
  }
  if (!theRequest.Body) {
    theRequest.Body = null;
  }
}
