import DI from "../../lib/di.ts";
import BasicAuthAuthorizer from "./modules/auth/basicAuth.ts";
import BearerTokenAuthorizer from "./modules/auth/bearerToken.ts";
import HeaderAuthorizer from "./modules/auth/header.ts";
import FileStorage from "./../../storage/files/mod.ts";
import QueryAuthorizer from "./modules/auth/query.ts";
import FileStore from "./stores/files.ts";

// deno-fmt-ignore
export function initDi(): void{
  DI.register("IAuthorizer",            () => new BasicAuthAuthorizer());
  DI.register("IAuthorizer",            () => new BearerTokenAuthorizer());
  DI.register("IAuthorizer",            () => new HeaderAuthorizer());
  DI.register("IAuthorizer",            () => new QueryAuthorizer());
  DI.register("IStore",                 () => new FileStore());
  DI.register("IStorage:HttpRequest",   () => new FileStorage('library', 'yml'));
  DI.register("IStorage:Scope",         () => new FileStorage('library', 'yml'));
  DI.register("IStorage:Collection",    () => new FileStorage('library', 'yml'));
  DI.register("IStorage:Context",       () => new FileStorage('library/contexts', 'yml'));
  DI.register("IStorage:Authorization", () => new FileStorage('library/auth', 'yml'));
  DI.register("IStorage:Cookies",       () => new FileStorage('library/cookies', 'yml'));
}
