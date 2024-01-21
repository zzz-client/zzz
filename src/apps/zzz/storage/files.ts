import { IStore, Model, SearchParams } from "../../../stores/files/store.ts";
import { default as ParentFileStore } from "../../../stores/files/store.ts";
import { Context } from "../modules/context/mod.ts";
import { HttpRequest } from "../modules/requests/mod.ts";
import { Authentication } from "../modules/auth/mod.ts";
import { Scope } from "../modules/scope/mod.ts";

const SESSION_FILE = "session.local";
const DirectoryMapping = new Map<typeof Model, string>();
DirectoryMapping.set(HttpRequest, "requests");
DirectoryMapping.set(Context, "contexts");
DirectoryMapping.set(Authentication, "auth");
DirectoryMapping.set(Scope, "");
export default class FileStore {
  private store: IStore = new ParentFileStore(".yml");
  get(modelType: typeof Model, id: string): Promise<Model> {
    const directory = DirectoryMapping.get(modelType) as string;
    if (modelType == HttpRequest) {
      return this.store.get(directory + "/" + id);
    } else {
      return this.store.get(directory + "/" + id);
    }
  }
  set(model: Model): Promise<void> {
    const directory = DirectoryMapping.get(Context);
    const sessionId = directory + "." + SESSION_FILE; // TODO
    return this.store.set(sessionId, model);
  }
  search(searchParams: SearchParams): Promise<Model[]> {
    return this.store.search(searchParams);
  }
}
