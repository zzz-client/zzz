import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Context, Entity, HttpMethod, ModelType } from "../../core/models.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import { IStore } from "../../core/app.ts";
import Schema from "./postman.schema.ts";
import { Meld } from "../../core/meld.ts";

export default class PostmanStore implements IStore {
  collection: Schema;
  constructor(collectionJsonFilePath: string) {
    if (existsSync(collectionJsonFilePath)) {
      this.collection = JSON.parse(Deno.readTextFileSync(collectionJsonFilePath));
    } else {
      console.warn("Invalid JSON file path??? " + collectionJsonFilePath);
      this.collection = {} as Schema;
    }
  }
  async get(modelType: ModelType, entityId: string, environmentName: string): Promise<any> {
    if (modelType === ModelType.Entity) {
      return await loadRequest(this.collection, environmentName, entityId);
    }
    if (modelType === ModelType.Collection) {
      return await Get(modelType, entityId, environmentName);
    }
    return Stores.YAML.get(modelType, entityId, environmentName);
  }
  async store(key: string, value: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
  setEnvironment(environmentName: string): void {
    throw new Error("Not implemented");
  }
}
async function loadRequest(schema: Schema, environmentName: string, entityFilePath: string): Promise<Entity> {
  console.debug("Loading theRequest from postman collection: ", entityFilePath);
  // TODO: Write this so it cna work recursively
  const collectionName = dirname(entityFilePath);
  const extension = extname(entityFilePath);
  const entityName = basename(entityFilePath, extension);
  const collection = schema.item.filter((item) => item.name === collectionName)[0];
  const entity = collection.item.filter((item) => item.name === entityName)[0].request;
  const theRequest = new Entity(entityFilePath, entityName, entity.url.raw.split("?")[0], entity.method as HttpMethod);
  if (entity.body) {
    theRequest.Body = entity.body.raw;
  }
  for (let header of entity.header) {
    theRequest.Headers[header.key] = header.value;
  }
  for (let query of entity.url.query) {
    theRequest.QueryParams[query.key] = query.value;
  }

  Meld(theRequest, await loadContext("globals"));
  // Meld(theRequest, await loadEnvironment("globals.local", null));
  Meld(theRequest, await loadContext(environmentName));
  Meld(theRequest, await loadContext(environmentName + ".local"));
  Meld(theRequest, await loadContext("session.local"));
  return theRequest;
}
async function loadContext(target: string): Promise<Context> {
  try {
    return (await Stores.YAML.get(ModelType.Context, target, "integrate")) as Context; // TODO: Hardcoded
  } catch (e) {
    return new Context("", ""); // TODO: WHAT
  }
}
