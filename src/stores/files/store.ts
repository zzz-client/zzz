import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { FileFormat, getFileFormat } from "./formats.ts";

export type SearchParams = string;

export interface IStore {
  get(id: string): Promise<Model>;
  set(id: string, model: Model): Promise<void>;
  search(searchParams: SearchParams): Promise<Model[]>;
}
export class Model {
  Id: string;
  Name: string;
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
  }
}
export interface ParentModel extends Model {
  Children: Model[];
}
export default class FileStore implements IStore {
  store = new FileStore("yml");
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async get(fullId: string): Promise<Model> {
    const fileInfo = await Deno.stat(fullId);
    if (fileInfo.isFile) {
      return this.getFile(fullId);
    } else if (fileInfo.isDirectory) {
      return this.getFolder(fullId);
    } else {
      throw new Error("Unknown type of thing on the filesystem: " + fullId);
    }
  }
  set(fullId: string, model: Model): Promise<void> {
    return Deno.writeTextFile(fullId + "." + this.fileExtension, this.driver().stringify(model));
  }
  search(searchParams: SearchParams): Promise<Model[]> {
    throw new Error("Not implemented");
  }
  private getFile(fullPath: string): Promise<Model> {
    const fileFormat = getFileFormat(this.fileExtension);
    return Deno.readTextFile(fullPath + "." + this.fileExtension)
      .then((fileContents) => {
        return fileFormat.parse(fileContents) as Model;
      }).then((result) => {
        result.Id = fullPath;
        if (!result.Name) {
          result.Name = basename(fullPath);
        }
        return result;
      });
  }
  private async getFolder(fullPath: string): Promise<Model> {
    const collection = new Model(fullPath, basename(fullPath)) as ParentModel;
    for await (const child of Deno.readDir(fullPath)) {
      if (child.isDirectory) {
        collection.Children.push(await this.getFolder(`${fullPath}/${child.name}`));
      } else if (child.isFile && !this.excludeFromInfo(child.name)) {
        const baseless = basename(child.name, extname(child.name));
        collection.Children.push(await this.getFolder(`${fullPath}/${baseless}`));
      }
    }
    return collection;
  }
  private excludeFromInfo(name: string): boolean {
    return !name.endsWith("." + this.fileExtension) || name.startsWith("_");
  }
  private driver(): FileFormat {
    return getFileFormat("." + this.fileExtension);
  }
}
