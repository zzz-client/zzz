import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Collection, Entity, Model, ModelType, StringToStringMap } from "../models.ts";
import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { IStore } from "../app.ts";
import { Driver, getDriver } from "../files/drivers.ts";

const SESSION_FILE = "session.local";

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async get(modelType: ModelType, entityId: string, context: string): Promise<Model> {
    if (modelType === ModelType.Entity) {
      const requestPath = entityId + "." + this.fileExtension;
      const resultRequest = await (await getDriver(requestPath)).parse(Deno.readTextFileSync(requestPath)) as Entity;
      resultRequest.Id = entityId;
      resultRequest.Type = ModelType[modelType];
      if (!resultRequest.Name) {
        resultRequest.Name = basename(entityId);
      }
      return resultRequest;
    } else if (modelType === ModelType.Collection) {
      const item = new (modelType === ModelType.Collection ? Collection : Collection)(entityId, basename(entityId));
      for await (const child of Deno.readDir(entityId)) {
        if (child.isDirectory) {
          item.Children.push(await this.get(ModelType.Collection, `${entityId}/${child.name}`, context));
        } else if (child.isFile && filetypeSupported(child.name) && !excludeFromInfo(child.name)) {
          const baseless = basename(child.name, extname(child.name));
          item.Children.push(await this.get(ModelType.Entity, `${entityId}/${baseless}`, context));
        }
      }
      item.Id = entityId;
      item.Type = ModelType[modelType];
      return item;
    }
    if (modelType === ModelType.Context || modelType === ModelType.Authorization) {
      const entityFolder = getDirectoryForModel(modelType);
      const filePath = `${entityFolder}/${entityId}.${this.fileExtension}`;
      console.log("Filepath: ", filePath);
      const item = this._driver().parse(Deno.readTextFileSync(filePath)) as Model; // TODO: Is this a naughty cast?
      item.Id = entityId;
      item.Type = ModelType[modelType];
      return item;
    }
    throw new Error(`Unknown type of entity: ${modelType}`);
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
  setContext(context: string): void {
    throw new Error("Not implemented");
  }
  _driver(): Driver {
    return getDriver("." + this.fileExtension);
  }
}

function filetypeSupported(filePath: string): boolean {
  try {
    getDriver(filePath);
    return true;
  } catch (error) {
    return false;
  }
}
function excludeFromInfo(name: string): boolean {
  return name.startsWith("_");
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
export function getDirectoryForModel(modelType: ModelType): string {
  switch (modelType) {
    case ModelType.Context:
      return "contexts";
    case ModelType.Authorization:
      return "authorizations";
    default:
      throw new Error(`Unknown entity type ${ModelType[modelType]}`);
  }
}
