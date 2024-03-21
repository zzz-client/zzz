import DI from "./core/di.ts";
import BasicAuthAuthorizer from "./core/modules/auth/basicAuth.ts";
import BearerTokenAuthorizer from "./core/modules/auth/bearerToken.ts";
import HeaderAuthorizer from "./core/modules/auth/header.ts";
import FileStorage from "./core/storage/files/mod.ts";
import QueryAuthorizer from "./core/modules/auth/query.ts";
import FileStore from "./core/stores/files.ts";
import ConfigStorage from "./core/storage/config/mod.ts";

// deno-fmt-ignore
export function initDi(): void{
  DI.register("IAuthorizer",            () => new BasicAuthAuthorizer());
  DI.register("IAuthorizer",            () => new BearerTokenAuthorizer());
  DI.register("IAuthorizer",            () => new HeaderAuthorizer());
  DI.register("IAuthorizer",            () => new QueryAuthorizer());
  DI.register("IStore",                 () => new FileStore());
  DI.register("IStorage:Scope",         () => new ConfigStorage('zzz.yml', 'yml'));
  DI.register("IStorage:HttpRequest",   () => new FileStorage('library', 'yml'));
  DI.register("IStorage:Collection",    () => new FileStorage('library', 'yml'));
  DI.register("IStorage:Context",       () => new FileStorage('library/contexts', 'yml'));
  DI.register("IStorage:Authorization", () => new FileStorage('library/auth', 'yml'));
  DI.register("IStorage:Cookies",       () => new FileStorage('library/cookies', 'yml'));
}
