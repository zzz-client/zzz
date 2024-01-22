import { IStorage, Model, SearchParams } from "../../../storage/mod.ts";
import FileStorage from "../../../storage/files/mod.ts";
import { IStore } from "./mod.ts";
import { Context } from "../modules/context/mod.ts";
import { HttpRequest } from "../modules/requests/mod.ts";
import { Authentication } from "../modules/auth/mod.ts";
import { Scope } from "../modules/scope/mod.ts";

const SESSION_FILE = "session.local";
const DirectoryMapping = new Map<string, string>();
DirectoryMapping.set(HttpRequest.name, "requests");
DirectoryMapping.set(Context.name, "contexts");
DirectoryMapping.set(Authentication.name, "auth");
DirectoryMapping.set(Scope.name, "requests");

export default class FileStore implements IStore {
  private store: IStorage = new FileStorage("yml");
  get(modelType: string, id: string): Promise<Model> {
    const directory = getDirectoryForModelType(modelType);
    return this.store.get(directory + "/" + id);
  }
  set(model: Model): Promise<void> {
    const directory = getDirectoryForModelType(model.constructor.name);
    const sessionId = directory + "." + SESSION_FILE; // TODO
    return this.store.set(sessionId, model);
  }
  search(searchParams: SearchParams): Promise<Model[]> {
    return this.store.search(searchParams);
  }
}

function getDirectoryForModelType(modelType: string): string {
  const directory = DirectoryMapping.get(modelType);
  if (!directory) {
    throw new Error("Unknown Model type: " + modelType);
  }
  return directory;
}
