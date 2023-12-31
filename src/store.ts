import { basename, Parsers } from "./libs.ts";
import Request, { Collection, Folder, Item } from "./request.ts";
import FileStore from "./stores/file.ts";
import PostmanStore from "./stores/postman.ts";
export enum EntityType {
  Request,
  Folder,
  Collection,
  Environment,
  Authorization,
}
export function getInstance(): IStore {
  return instance;
}
export const Stores = {
  JSON: new FileStore("json"),
  YAML: new FileStore("yml"),
  XML: new FileStore("xml"),
  Postman: new PostmanStore("PostmanCollection.json"),
};
const instance: IStore = Stores.YAML; // TODO: Make dynamic somehow

export async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["REST API"]; // TODO: Hardcoded
  for (const collection of collections) {
    result.push(await Get(EntityType.Collection, collection, null));
  }
  return result;
}

export default function Store(key: string, value: string, environmentName: string): any {
  return getInstance().store(key, value, environmentName);
}
export async function Get(entityType: EntityType, entityName: string, environmentName: string | null): Promise<any> {
  if (entityType === EntityType.Request) {
    return loadRequest(entityName, environmentName);
  } else {
    return getInstance().get(entityType, entityName, environmentName);
  }
}
export interface IStore {
  get(entityType: EntityType, entityName: string, environmentName: string | null): Promise<any>;
  store(key: string, value: any, environmentName: string): Promise<void>;
}

async function loadRequest(requestFilePath: string, environmentName: string | null): Promise<Request> {
  const theRequest = await getInstance().get(EntityType.Request, requestFilePath, environmentName);
  loadBody(theRequest, requestFilePath, environmentName);
  theRequest.Name = basename(requestFilePath);
  return theRequest;
}
function loadBody(theRequest: Request, _requestFilePath: string, _environmentName: string | null) {
  if (typeof theRequest.Body === "string") {
    theRequest.Body = Parsers.JSON.parse(theRequest.Body); // TODO: Different for different types?
  }
  if (!theRequest.Body) {
    theRequest.Body = null;
  }
}
