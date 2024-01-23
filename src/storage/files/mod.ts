import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../mod.ts";

import { getFileFormat } from "./formats.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Meld } from "../../lib/lib.ts";
const DEFAULT_MARKER = "_defaults";

export default class FileStorage implements IStorage {
  private WORKING_DIR = "..";
  fileExtension: string;
  constructor(fileExtension: string) {
    this.fileExtension = fileExtension;
  }
  async get(fullId: string): Promise<Model> {
    if (await this.isFile(fullId)) {
      return this.getFile(fullId);
    } else {
      return this.getFolder(fullId);
    }
  }
  set(fullId: string, model: Model): Promise<void> {
    // TODO set
    throw new Error("Not implemented");
  }
  search(_searchParams: SearchParams): Promise<Model[]> {
    // TODO search
    throw new Error("Not implemented");
  }

  private async isFile(fullId: string): Promise<boolean> {
    try {
      return (await Deno.stat(this.adjustPath(fullId))).isFile;
    } catch (error) {
      return (await Deno.stat(this.adjustPath(fullId, true))).isFile;
    }
  }
  private getFile(fullPath: string): Promise<Model> {
    const fileFormat = getFileFormat(this.fileExtension);
    return Deno.readTextFile(this.adjustPath(fullPath, true))
      .then((fileContents) => {
        return fileFormat.parse(fileContents) as Model;
      }).then((result) => {
        return result;
      });
  }
  private async getFolder(fullPath: string): Promise<ParentModel> {
    const model = { Id: fullPath, Name: basename(fullPath), Children: [] as Model[] } as ParentModel;
    for await (const child of Deno.readDir(this.adjustPath(fullPath))) {
      if (child.isDirectory) {
        const x = await this.getFolder(`${fullPath}/${child.name}`);
        model.Children.push(x);
      } else if (child.isFile && this.isFileToInclude(child.name)) {
        const baseless = basename(child.name, extname(child.name));
        model.Children.push(await this.getFile(`${fullPath}/${baseless}`));
      }
    }
    if (existsSync(this.adjustPath(fullPath + "/" + DEFAULT_MARKER, true))) {
      const defaults = await this.getFile(fullPath + "/" + DEFAULT_MARKER);
      Meld(model, defaults);
    }
    return model;
  }
  private isFileToInclude(name: string): boolean {
    return name.endsWith("." + this.fileExtension) && !name.startsWith("_");
  }
  private adjustPath(fullPath: string, extension = false): string {
    if (extension) {
      return this.WORKING_DIR + "/" + fullPath + "." + this.fileExtension;
    } else {
      return this.WORKING_DIR + "/" + fullPath;
    }
  }
}
