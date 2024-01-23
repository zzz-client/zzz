import { basename } from "https://deno.land/std/path/mod.ts";
import { IStorage, Model, SearchParams } from "../../../storage/mod.ts";
import FileStorage from "../../../storage/files/mod.ts";
import { IStore } from "./mod.ts";
import { Context } from "../modules/context/mod.ts";
import { Collection, HttpRequest } from "../modules/requests/mod.ts";
import { Authorization } from "../modules/auth/mod.ts";
import { Scope } from "../modules/scope/mod.ts";
import { Cookies } from "../modules/cookies/mod.ts";

const SESSION_FILE = "session.local";
const DirectoryMapping = new Map<string, string>();
DirectoryMapping.set(HttpRequest.name, "requests");
DirectoryMapping.set(Scope.name, "requests");
DirectoryMapping.set(Collection.name, "requests");
DirectoryMapping.set(Context.name, "contexts");
DirectoryMapping.set(Authorization.name, "auth");
DirectoryMapping.set(Cookies.name, "cookies");

export default class FileStore implements IStore {
  private storage: IStorage = new FileStorage("yml");
  async get(modelType: string, id: string): Promise<Model> {
    const directory = this.getDirectoryForModelType(modelType);
    if (modelType == Collection.constructor.name) {
      console.log("Bro what", modelType);
      throw new Error("Bro what");
      // ???
    }
    const result = await this.storage.get(directory + "/" + id);
    result.Id = id;
    if (!result.Name) { // TODO: Why is this not working when --all is passed
      result.Name = basename(id);
    }
    return result;
  }
  set(model: Model): Promise<void> {
    const directory = this.getDirectoryForModelType(model.constructor.name);
    const sessionId = directory + "." + SESSION_FILE; // TODO
    return this.storage.set(sessionId, model);
  }
  search(searchParams: SearchParams): Promise<Model[]> {
    return this.storage.search(searchParams);
  }
  private getDirectoryForModelType(modelType: string): string {
    const directory = DirectoryMapping.get(modelType);
    if (!directory) {
      throw new Error("Unknown Model type: " + modelType);
    }
    return directory;
  }
}

// private NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
// }
// function checkForbidden(modelContents: any): void {
//   for (const key of this.NO_DEFAULT_ALLOWED) {
//     if (modelContents[key]) {
//       throw new Error(`Forbidden key ${key}`);
//     }
//   }
