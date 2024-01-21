import { IStore, Model, SearchParams } from "../../../stores/files/store.ts";
import FileStorage} from "../../../stores/files/store.ts";
import { Context } from "../modules/context/mod.ts";
import { HttpRequest } from "../modules/requests/mod.ts";
import { Authentication } from "../modules/auth/mod.ts";
import { Scope } from "../modules/scope/mod.ts";

const SESSION_FILE = "session.local";
const DirectoryMapping = new Map<typeof Model, string>();
DirectoryMapping.set(HttpRequest, "requests");
DirectoryMapping.set(Context, "contexts");
DirectoryMapping.set(Authentication, "auth");
DirectoryMapping.set(Scope, "requests");
export default class FileStore {
  private store: IStore = new FileStorage("yml");
  get(modelType: typeof Model, id: string): Promise<Model> {
    console.log("model", modelType, "!", id);
    const directory = DirectoryMapping.get(modelType) as string;
    console.log("directory", directory);
    return this.store.get(directory + "/" + id);
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
