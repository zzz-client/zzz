import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { basename, extname } from "https://deno.land/std/path/mod.ts";
import { newInstance as iNewInstance } from "../../lib/di.ts";
import { Meld, Trace } from "../../lib/etc.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../mod.ts";
import { getFileFormat } from "./formats.ts";
const DEFAULT_MARKER = "_defaults";

const newInstance = {
  newInstance(baseDir: string, fileExt: string): object {
    return new FileStorage(baseDir, fileExt);
  },
} as iNewInstance;
export { newInstance };

export default class FileStorage implements IStorage {
  private baseDir;
  private fileExtension: string;
  constructor(baseDir: string, fileExtension: string) {
    this.baseDir = baseDir;
    this.fileExtension = fileExtension;
  }
  async get(fullId: string): Promise<Model> {
    if (await this.isFile(fullId)) {
      return this.getFile(fullId);
    } else {
      return this.getFolder(fullId);
    }
  }
  set(_fullId: string, _model: Model): Promise<void> {
    // TODO set
    throw new Error("Not implemented");
  }
  search(_searchParams: SearchParams): Promise<Model[]> {
    // TODO search
    throw new Error("Not implemented");
  }
  // async list(directory: string): Promise<Model[]> {
  //   console.log("Getting list of ", directory);
  //   return await this.getFolder(directory).Children;
  // }
  private async isFile(fullId: string): Promise<boolean> {
    Trace("FileStorage: Checking if file: " + fullId);
    try {
      return (await Deno.stat(this.adjustPath(fullId))).isFile;
    } catch (_error) {
      return (await Deno.stat(this.adjustPath(fullId, true))).isFile;
    }
  }
  private getFile(fullPath: string): Promise<Model> {
    const fileFormat = getFileFormat(this.fileExtension);
    Trace(`Getting file ${fileFormat} ${fullPath}`);
    return Deno.readTextFile(this.adjustPath(fullPath, true))
      .then((fileContents) => {
        Trace("File contents:", fileContents);
        return fileFormat.parse(fileContents) as Model;
      });
  }
  private async getFolder(fullPath: string): Promise<ParentModel> {
    const model = { Id: fullPath, Name: basename(fullPath), Children: [] as Model[] } as ParentModel;
    Trace("Getting folder " + fullPath);
    for await (const child of Deno.readDir(this.adjustPath(fullPath))) {
      if (child.isDirectory) {
        Trace("Child is directory");
        const x = await this.getFolder(`${fullPath}/${child.name}`);
        Trace("Folder: " + x.Id);
        model.Children.push(x);
      } else if (child.isFile && this.isFileToInclude(child.name)) {
        Trace("Child is file");
        const baseless = basename(child.name, extname(child.name));
        Trace(`${fullPath}/${baseless}`);
        model.Children.push(await this.getFile(`${fullPath}/${baseless}`));
      }
    }
    if (existsSync(this.adjustPath(fullPath + "/" + DEFAULT_MARKER, true))) {
      Trace("Loading folder defaults");
      const defaults = await this.getFile(fullPath + "/" + DEFAULT_MARKER);
      Trace("Defaults:", defaults);
      Meld(model, defaults);
    }
    return model;
  }
  private isFileToInclude(name: string): boolean {
    Trace("is file to include? " + name);
    const result = name.endsWith("." + this.fileExtension) && !name.startsWith("_");
    Trace(result);
    return result;
  }
  private adjustPath(fullPath: string, extension = false): string {
    if (extension) {
      return this.baseDir + "/" + fullPath + "." + this.fileExtension;
    } else {
      return this.baseDir + "/" + fullPath;
    }
  }
}
