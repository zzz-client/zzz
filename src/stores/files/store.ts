import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { IStore } from "../../apps/zzz/app.ts";
import { FileFormat, getFileFormat } from "./formats.ts";
import { Model, StringToStringMap } from "../../lib/lib.ts";
import { Collection } from "../../apps/zzz/modules/requests/mod.ts";

const SESSION_FILE = "session.local";

const DirectoryMapping = {
  HttpRequest: "requests",
  Context: "contexts",
  Authorization: "authorizations",
  Scope: ".",
} as unknown as { ModelType: string };

type SearchParams = string;

export default class FileStore implements IStore {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async get(type: typeof Model, id: string): Promise<Model> {
    const directory = DirectoryMapping[type] as string;
    const result = await (await getFileFormat(this.fileExtension)).parse(Deno.readTextFileSync(directory + "/" + id + "." + this.fileExtension)) as Model;
    result.Id = id.substring(directory.length + 1); // TODO: Hack?
    if (!result.Name) {
      result.Name = basename(id);
    }
    return Promise.resolve(result);
  }
  set(type: typeof Model, key: string, value: any): Promise<void> {
    const directory = DirectoryMapping[type] as string;
    const sessionPath = directory + "/" + SESSION_FILE + "." + this.fileExtension;
    let sessionContents = { Variables: {} as StringToStringMap };
    if (existsSync(sessionPath)) {
      sessionContents = this.driver().parse(Deno.readTextFileSync(sessionPath));
    }
    sessionContents.Variables[key] = value;
    Deno.writeTextFileSync(sessionPath, this.driver().stringify(sessionContents));
    return Promise.resolve();
  }

  async search(modelType: typeof Model, searchParams: SearchParams): Promise<Model[]> {
    const folder = getDirectoryForModel(modelType);
    const result: Model[] = [];
    for await (const child of Deno.readDir(folder)) {
      result.push(new Scope(child.name, child.name));
    }
    return result;
  }
  private excludeFromInfo(name: string): boolean {
    return !name.endsWith("." + this.fileExtension) || name.startsWith("_");
  }
  private driver(): FileFormat {
    return getFileFormat("." + this.fileExtension);
  }
  private async getScope(scopeId: string): Promise<Scope> {
    const scopeFolder = getDirectoryForModel(ModelType.Scope);
    const fullPath = scopeFolder + "/" + scopeId;
    console.log("Scope id vs full path", scopeId, fullPath);
    const scopeName = scopeId;
    const scope = new Scope(scopeId, scopeName);
    for await (const child of Deno.readDir(fullPath)) {
      if (child.isDirectory) {
        scope.Children.push(await this.getCollectionFullId(`${fullPath}/${child.name}`));
      } else if (child.isFile && !this.excludeFromInfo(child.name)) {
        // const baseless = basename(child.name, extname(child.name));
        // scope.Children.push(await this.getEntityFullId(`${fullPath}/${child.name}`));
      }
    }
    return scope;
  }
  private async getCollectionFullId(collectionId: string): Promise<Collection> {
    const collection = new Collection(collectionId, basename(collectionId));
    for await (const child of Deno.readDir(collectionId)) {
      if (child.isDirectory) {
        collection.Children.push(await this.getCollectionFullId(`${collectionId}/${child.name}`));
      } else if (child.isFile && !this.excludeFromInfo(child.name)) {
        const baseless = basename(child.name, extname(child.name));
        collection.Children.push(await this.getEntityFullId(`${collectionId}/${baseless}`));
      }
    }
    return collection;
  }
  private getAuthenticationOrContext(modelType: typeof Model, itemId: string): Promise<Model> {
    const directory = getDirectoryForModel(modelType);
    const filePath = `${directory}/${itemId}.${this.fileExtension}`;
    const item = this.driver().parse(Deno.readTextFileSync(filePath)) as Model; // TODO: Is this a naughty cast?
    item.Id = itemId;
    return Promise.resolve(item);
  }
}
