import { Parsers } from "./libs.ts";
import Request from "./request.ts";
import FileStore from "./stores/file.ts";
import PostmanStore from "./stores/postman.ts";
export enum EntityType {
  Request,
  Environment,
  Authorization,
}
export function getInstance(): IStore {
  return instance;
}
export const Stores = {
  // Postman: newInstance("postman"),
  JSON: newInstance("json"),
  YAML: newInstance("yaml"),
  XML: newInstance("xml"),
};
const instance: IStore = Stores.YAML; // TODO: Make dynamic somehow

class Collection {
  name: string;
  folders: Folder[];
  constructor(name: string) {
    this.name = name;
    this.folders = [];
  }
}
class Folder {
  name: string;
  children: Item[];
  constructor(name: string) {
    this.name = name;
    this.children = [];
  }
}
type Item = Request | Folder | string;

export async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  result.push(new Collection("REST API")); // TODO: Hardcoded
  return result;
}

export async function Info(folderPath: string): Promise<Item[]> {
  const result = [] as Item[];
  const children = await Deno.readDirSync(folderPath); // TODO: libs
  for (const child of children) {
    if (child.isDirectory) {
      result.push(new Folder(child.name));
    } else if (!child.name.startsWith("defaults.")) {
      // result.push(child.name);
      const extensionlessName = child.name.substring(0, child.name.lastIndexOf("."));
      result.push(await Get(EntityType.Request, folderPath + "/" + extensionlessName, null));
    }
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
function newInstance(type: string): IStore {
  switch (type.toLowerCase()) {
    case "json":
      return new FileStore("json");
    case "yml":
    default:
      return new FileStore("yml");
    case "xml":
      return new FileStore("xml");
    case "postman":
      return new PostmanStore("PostmanCollection.json");
  }
}

async function loadRequest(requestFilePath: string, environmentName: string | null): Promise<Request> {
  const theRequest = await getInstance().get(EntityType.Request, requestFilePath, environmentName);
  loadBody(theRequest, requestFilePath, environmentName);
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
