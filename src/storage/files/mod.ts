import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { FileFormat, getFileFormat } from "./formats.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../mod.ts";

export default class FileStorage implements IStorage {
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }

  async isFile(fullId: string): Promise<boolean> {
    try {
      return (await Deno.stat("/home/projects/zzz/" + fullId)).isFile;
    } catch (error) {
      return (await Deno.stat("/home/projects/zzz/" + fullId + "." + this.fileExtension)).isFile;
    }
  }
  async get(fullId: string): Promise<Model> {
    if (await this.isFile(fullId)) {
      return this.getFile(fullId);
    } else {
      return this.getFolder(fullId);
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
    return Deno.readTextFile("/home/projects/zzz/" + fullPath + "." + this.fileExtension)
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
    const model = { Id: fullPath, Name: basename(fullPath) } as ParentModel;
    for await (const child of Deno.readDir(fullPath)) {
      if (child.isDirectory) {
        model.Children.push(await this.getFolder(`${fullPath}/${child.name}`));
      } else if (child.isFile && !this.excludeFromInfo(child.name)) {
        const baseless = basename(child.name, extname(child.name));
        model.Children.push(await this.getFile(`${fullPath}/${baseless}`));
      }
    }
    return model;
  }
  private excludeFromInfo(name: string): boolean {
    return !name.endsWith("." + this.fileExtension) || name.startsWith("_");
  }
  private driver(): FileFormat {
    return getFileFormat("." + this.fileExtension);
  }
}
