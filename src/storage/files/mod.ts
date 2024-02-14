import { basename, exists, extname, join } from "../../lib/deps.ts";
import { Meld, Trace } from "../../lib/etc.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../mod.ts";
import { getFileFormat } from "./formats.ts";
const DEFAULT_MARKER = "_defaults";

export default class FileStorage implements IStorage {
  private baseDir;
  private fileExtension: string;
  constructor(baseDir: string, fileExtension: string) {
    this.baseDir = baseDir;
    this.fileExtension = fileExtension;
  }
  async has(id: string): Promise<boolean> {
    Trace("FileStorage: Checking if exists: " + this.adjustPath(id, true));
    return (await exists(this.adjustPath(id, false))) || (await exists(this.adjustPath(id, true)));
  }
  async get(fullId: string): Promise<Model> {
    if (await this.isFile(fullId)) {
      return this.getFile(fullId);
    } else {
      return this.getFolder(fullId);
    }
  }
  async put(model: Model): Promise<void> {
    if (await this.isFile(model.Id)) {
      await this.putFile(model);
    } else {
      await this.putFolder(model);
    }
  }
  async delete(id: string): Promise<void> {
    if (await exists(id)) {
      const fullPath = this.adjustPath(id, await this.isFile(id));
      await Deno.remove(fullPath);
    }
  }
  search(_searchParams: SearchParams): Promise<Model[]> {
    // TODO search
    throw new Error("Not implemented");
  }
  move(oldId: string, newId: string): Promise<void> {
    return Deno.rename(oldId, newId);
  }
  async list(directory: string): Promise<Model[]> {
    console.log("Getting list of ", directory);
    return (await this.getFolder(directory)).Children;
  }
  private async isFile(fullId: string): Promise<boolean> {
    try {
      return (await Deno.stat(this.adjustPath(fullId, true))).isFile;
    } catch (_error) {
      return (await Deno.stat(this.adjustPath(fullId, false))).isFile;
    }
  }
  private async getFile(fullPath: string): Promise<Model> {
    const fileFormat = getFileFormat(this.fileExtension);
    Trace(`Getting file ${fullPath}`);
    const fileContents = await Deno.readTextFile(this.adjustPath(fullPath, true));
    Trace("File contents:", fileContents);
    const model = fileFormat.parse(fileContents) as Model;
    model.Id = fullPath;
    model.Name = basename(fullPath);
    return Promise.resolve(model);
  }
  private async getFolder(fullPath: string): Promise<ParentModel> {
    const model = { Id: fullPath, Name: basename(fullPath), Children: [] as Model[] } as ParentModel;
    Trace("Getting folder " + fullPath);
    await this.readDirectoryToFolder(model);
    await this.readDirectoryDefaults(model);
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
      return join(Deno.cwd(), this.baseDir, fullPath + "." + this.fileExtension);
    } else {
      return join(Deno.cwd(), this.baseDir, fullPath);
    }
  }
  private async readDirectoryToFolder(model: ParentModel): Promise<void> {
    for await (const child of Deno.readDir(this.adjustPath(model.Id))) {
      if (child.isDirectory) {
        Trace("Child is directory");
        const x = await this.getFolder(`${model.Id}/${child.name}`);
        Trace("Folder: " + x.Id);
        model.Children.push(x);
      } else if (child.isFile && this.isFileToInclude(child.name)) {
        Trace("Child is file");
        const baseless = basename(child.name, extname(child.name));
        Trace(`${model.Id}/${baseless}`);
        model.Children.push(await this.getFile(`${model.Id}/${baseless}`));
      }
    }
  }
  private async readDirectoryDefaults(model: ParentModel): Promise<void> {
    if (await exists(this.adjustPath(model.Id + "/" + DEFAULT_MARKER, true))) {
      Trace("Loading folder defaults");
      const defaults = await this.getFile(model.Id + "/" + DEFAULT_MARKER);
      Trace("Defaults:", defaults);
      Meld(model, defaults);
    }
  }
  private async putFile(model: Model): Promise<void> {
    const fileFormat = getFileFormat(this.fileExtension);
    Trace(`Putting file ${fileFormat} ${model.Id}`);
    await Deno.writeTextFile(model.Id, fileFormat.stringify(model));
  }
  private async putFolder(model: Model): Promise<void> {
    if (!(await exists(model.Id))) {
      Deno.mkdir(model.Id, { recursive: true });
    }
    const defaultFilePath = model.Id + "/" + DEFAULT_MARKER;
    // TODO: Does this work as intended?
    // deno-lint-ignore no-explicit-any
    const what = { ...model } as any;
    delete what.Id;
    delete what.Name;
    if (Object.keys(what).length > 0 || await exists(defaultFilePath)) {
      const fileFormat = getFileFormat(this.fileExtension);
      Trace(`Putting folder defaults ${fileFormat} ${model.Id}`);
      await Deno.writeTextFile(defaultFilePath, fileFormat.stringify(what));
    }
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, fail, it } from "../../lib/tests.ts";

describe("FileStorage", () => {
  describe("has", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("get", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("put", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("delete", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("search", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("move", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("list", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("isFile", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("getFile", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("getFolder", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("isFileToInclude", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("adjustPath", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("readDirectoryToFolder", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("readDirectoryDefaults", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("putFile", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("putFolder", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
});
