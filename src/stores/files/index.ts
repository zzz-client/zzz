import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Collection, Entity, Model, ModelType, Scope, StringToStringMap } from "../../core/models.ts";
import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { IStore } from "../../core/app.ts";
import { Driver, getDriver } from "../../stores/files/drivers.ts";

const SESSION_FILE = "session.local";

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async list(modelType: ModelType.Scope | ModelType.Context | ModelType.Authorization): Promise<Model[]> {
    const folder = getDirectoryForModel(modelType);
    const result: Model[] = [];
    for await (const child of Deno.readDir(folder)) {
      result.push(new Scope(child.name, child.name));
    }
    return result;
  }
  async get(modelType: ModelType, modelId: string): Promise<Model> {
    console.log("Getting " + ModelType[modelType]);
    switch (modelType) {
      case ModelType.Entity:
        return this.getEntity(modelId);
      case ModelType.Collection:
        return this.getCollection(modelId);
      case ModelType.Scope:
        return this.getScope(modelId);
      case ModelType.Context:
      case ModelType.Authorization:
        return this.getAuthenticationOrContext(modelType, modelId);
      default:
        throw new Error(`Unknown type of entity: ${modelType}`);
    }
  }
  store(key: string, value: any): Promise<void> {
    const sessionPath = getDirectoryForModel(ModelType.Context) + "/" + SESSION_FILE + "." + this.fileExtension;
    let sessionContents = { Variables: {} as StringToStringMap };
    if (existsSync(sessionPath)) {
      sessionContents = this._driver().parse(Deno.readTextFileSync(sessionPath));
    }
    sessionContents.Variables[key] = value;
    Deno.writeTextFileSync(sessionPath, this._driver().stringify(sessionContents));
    return Promise.resolve();
  }
  _driver(): Driver {
    return getDriver("." + this.fileExtension);
  }
  async getEntity(entityId: string): Promise<Entity> {
    const requestPath = entityId + "." + this.fileExtension;
    const resultRequest = await (await getDriver(requestPath)).parse(Deno.readTextFileSync(requestPath)) as Entity;
    resultRequest.Id = entityId;
    resultRequest.Type = ModelType[ModelType.Entity];
    if (!resultRequest.Name) {
      resultRequest.Name = basename(entityId);
    }
    return resultRequest;
  }
  async getCollection(collectionId: string): Promise<Collection> {
    const collection = new Collection(collectionId, basename(collectionId));
    for await (const child of Deno.readDir(collectionId)) {
      if (child.isDirectory) {
        collection.Children.push(await this.getCollection(`${collectionId}/${child.name}`));
      } else if (child.isFile && !this.excludeFromInfo(child.name)) {
        const baseless = basename(child.name, extname(child.name));
        collection.Children.push(await this.getEntity(`${collectionId}/${baseless}`));
      }
    }
    return collection;
  }
  async getScope(scopeId: string): Promise<Scope> {
    const scopeFolder = getDirectoryForModel(ModelType.Scope);
    const fullPath = scopeFolder + "/" + scopeId;
    const scopeName = scopeId;
    const scope = new Scope(scopeId, scopeName);
    for await (const child of Deno.readDir(fullPath)) {
      if (child.isDirectory) {
        scope.Children.push(await this.getCollection(`${fullPath}/${child.name}`));
      } else if (child.isFile && !this.excludeFromInfo(child.name)) {
        const baseless = basename(child.name, extname(child.name));
        scope.Children.push(await this.getEntity(`${fullPath}/${baseless}`));
      }
    }
    return scope;
  }
  getAuthenticationOrContext(modelType: ModelType, itemId: string): Promise<Model> {
    const directory = getDirectoryForModel(modelType);
    const filePath = `${directory}/${itemId}.${this.fileExtension}`;
    const item = this._driver().parse(Deno.readTextFileSync(filePath)) as Model; // TODO: Is this a naughty cast?
    item.Id = itemId;
    item.Type = ModelType[modelType];
    return Promise.resolve(item);
  }
  excludeFromInfo(name: string): boolean {
    return !name.endsWith("." + this.fileExtension) || name.startsWith("_");
  }
}

// async function determineType(modelId: string): Promise<ModelType> {
//   if (modelId.startsWith(getDirectoryForModel(ModelType.Authorization))) {
//     return ModelType.Authorization;
//   }
//   if (modelId.startsWith(getDirectoryForModel(ModelType.Context))) {
//     return ModelType.Context;
//   }
//   if (existsSync(modelId, { isFile: true })) {
//     return ModelType.Entity;
//   } else if (modelId.includes("/")) {
//     return ModelType.Collection;
//   }
// }
function getDirectoryForModel(modelType: ModelType): string {
  switch (modelType) {
    case ModelType.Scope:
      return "library";
    case ModelType.Context:
      return getDirectoryForModel(ModelType.Scope) + "/contexts";
    case ModelType.Authorization:
      return getDirectoryForModel(ModelType.Scope) + "/authorizations";
    default:
      throw new Error(`Unknown entity type ${ModelType[modelType]}`);
  }
}
