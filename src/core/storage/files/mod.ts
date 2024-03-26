import { basename, exists, extname, join } from "../../deps.ts";
import { asAny, Meld, Trace } from "../../etc.ts";
import { IStorage, Model, ParentModel, SearchParams } from "../mod.ts";
import { getFileFormat } from "./formats.ts";
const DEFAULT_MARKER = "_collection";

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
  async retrieve(fullId: string): Promise<Model> {
    Trace("Retrieving " + fullId);
    if (await this.isFile(fullId)) {
      return this.getFile(fullId);
    } else if (await this.isDirectory(fullId)) {
      return this.getDirectory(fullId);
    } else {
      throw new Error("File not found: " + fullId);
    }
  }
  rename(_oldId: string, _newId: string): Promise<void> {
    // TODO
    throw new Error("Method not implemented.");
  }
  async save(model: Model): Promise<void> {
    if (await this.isFile(model.Id)) {
      await this.putFile(model);
    } else if (await this.isDirectory(model.Id)) {
      await this.putDirectory(model);
    } else {
      await this.putFile(model);
    }
  }
  async delete(id: string): Promise<void> {
    const fullPath = this.adjustPath(id, await this.isFile(id));
    await Deno.remove(fullPath);
  }
  search(_searchParams: SearchParams): Promise<Model[]> {
    // TODO search
    throw new Error("Not implemented");
  }
  move(oldId: string, newId: string): Promise<void> {
    return Deno.rename(oldId, newId);
  }
  async list(): Promise<Model[]> {
    console.log("Getting list of ", ".");
    return (await this.getDirectory(".")).Children;
  }

  private async isFile(fullId: string): Promise<boolean> {
    try {
      return (await Deno.stat(this.adjustPath(fullId, true))).isFile;
    } catch (_error) {
      return false;
    }
  }
  private async isDirectory(fullId: string): Promise<boolean> {
    try {
      Trace("Adjusted path " + this.adjustPath(fullId, false));
      return (await Deno.stat(this.adjustPath(fullId, false))).isDirectory;
    } catch (_error) {
      return false;
    }
  }
  private async getFile(fullPath: string): Promise<Model> {
    const fileFormat = getFileFormat(this.fileExtension);
    Trace(`Getting file ${fullPath}`);
    const fileContents = await Deno.readTextFile(this.adjustPath(fullPath, true));
    Trace("File contents:", fileContents);
    const model = fileFormat.parse(fileContents) as Model;
    model.Id = fullPath;
    if (model.Id.startsWith("./")) {
      model.Id = model.Id.substring("./".length);
    }
    if (fullPath.endsWith("/" + DEFAULT_MARKER)) {
      const splitsies = fullPath.split("/");
      splitsies.pop();
      model.Name = splitsies.pop()!;
    } else {
      model.Name = basename(fullPath);
    }
    return Promise.resolve(model);
  }
  private async getDirectory(fullPath: string): Promise<ParentModel> {
    const model = { Id: fullPath, Name: basename(fullPath), Children: [] as Model[] } as ParentModel;
    if (model.Id.startsWith("./")) {
      model.Id = model.Id.substring("./".length);
    }
    Trace("Getting directory " + fullPath);
    await this.readDirectoryToDirectory(model);
    await this.readDirectoryDefaults(model);
    return model;
  }
  private isFileToInclude(name: string): boolean {
    Trace("is file to include? " + name);
    const result = name.endsWith("." + this.fileExtension) && !basename(name).startsWith("_");
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
  private async readDirectoryToDirectory(model: ParentModel): Promise<void> {
    const filepath = this.adjustPath(model.Id);
    for await (const child of Deno.readDir(filepath)) {
      if (child.isDirectory && !basename(filepath).startsWith("_")) {
        Trace("Child is directory");
        const x = await this.getDirectory(`${model.Id}/${child.name}`);
        Trace("Directory: " + x.Id);
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
      Trace("Loading directory defaults");
      const defaults = await this.getFile(model.Id + "/" + DEFAULT_MARKER);
      Trace("Defaults:", defaults);
      Meld(model, defaults);
    }
  }
  private async putFile(model: Model): Promise<void> {
    const fileFormat = getFileFormat(this.fileExtension);
    console.log("PUTTING FILE", model);
    const fullPath = this.adjustPath(model.Id, true);
    delete asAny(model).Id;
    await Deno.writeTextFile(fullPath, fileFormat.stringify(model));
  }
  private async putDirectory(model: Model): Promise<void> {
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
      Trace(`Putting directory defaults ${fileFormat} ${model.Id}`);
      await Deno.writeTextFile(defaultFilePath, fileFormat.stringify(what));
    }
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "../../tests.ts";

describe("FileStorage", () => {
  describe("has", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("get", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("put", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("delete", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("search", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("move", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("list", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("isFile", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("getFile", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("getDirectory", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("isFileToInclude", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("adjustPath", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("readDirectoryToDirectory", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("readDirectoryDefaults", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("putFile", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
  describe("putDirectory", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
});
