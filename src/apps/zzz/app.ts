import DI from "../../lib/di.ts";
import * as BasicAuthAuthorizer from "./modules/auth/basicAuth.ts";
import * as BearerTokenAuthorizer from "./modules/auth/bearerToken.ts";
import * as HeaderAuthorizer from "./modules/auth/header.ts";
import * as FileStorage from "./../../storage/files/mod.ts";
import * as QueryAuthorizer from "./modules/auth/query.ts";
import * as FileStore from "./stores/files.ts";

// deno-fmt-ignore
export function initDi(): void{
  DI.register("IAuthorizer",            BasicAuthAuthorizer.newInstance, "BasicAuth");
  DI.register("IAuthorizer",            BearerTokenAuthorizer.newInstance, "BearerToken");
  DI.register("IAuthorizer",            HeaderAuthorizer.newInstance, "HeaderAuthorizer");
  DI.register("IAuthorizer",            QueryAuthorizer.newInstance, "QueryAuthorizer");
  DI.register("IStore",                 FileStore.newInstance);
  DI.register("IStorage:HttpRequest",   FileStorage.newInstance, ["request", "yml"]);
  DI.register("IStorage:Scope",         FileStorage.newInstance, ["request", "yml"]);
  DI.register("IStorage:Collection",    FileStorage.newInstance, ["request", "yml"]);
  DI.register("IStorage:Context",       FileStorage.newInstance, ["contexts", "yml"]);
  DI.register("IStorage:Authorization", FileStorage.newInstance, ["auth", "yml"]);
  DI.register("IStorage:Cookies",       FileStorage.newInstance, ["cookies", "yml"]);
}
