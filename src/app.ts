import DI from "./core/di.ts";
import BasicAuthAuthorizer from "./core/modules/auth/basicAuth.ts";
import BearerTokenAuthorizer from "./core/modules/auth/bearerToken.ts";
import HeaderAuthorizer from "./core/modules/auth/header.ts";
import FileStorage from "./core/storage/files/mod.ts";
import QueryAuthorizer from "./core/modules/auth/query.ts";
import FileStore from "./core/stores/files.ts";
import ConfigStorage from "./core/storage/config/mod.ts";
import { Command } from "./core/deps.ts";

const APP_VERSION = "0.85.0";

// deno-fmt-ignore
export function initDi(): void{
  DI.register("IAuthorizer",            () => new BasicAuthAuthorizer());
  DI.register("IAuthorizer",            () => new BearerTokenAuthorizer());
  DI.register("IAuthorizer",            () => new HeaderAuthorizer());
  DI.register("IAuthorizer",            () => new QueryAuthorizer());
  DI.register("IStore",                 () => new FileStore({
    location: '.',
    fileFormat: 'yml'
  }));
  DI.register("IStorage:Scope",         () => new ConfigStorage('zzz.yml', 'yml'));
  DI.register("IStorage:HttpRequest",   () => new FileStorage('.', 'yml'));
  DI.register("IStorage:Collection",    () => new FileStorage('.', 'yml'));
  DI.register("IStorage:Context",       () => new FileStorage('./_contexts', 'yml'));
  DI.register("IStorage:Authorization", () => new FileStorage('./_auth', 'yml'));
  DI.register("IStorage:Cookies",       () => new FileStorage('./_cookies', 'yml'));
}

export default function createAppCommand(): Command {
  const cmd = new Command();
  cmd.name("zzz").version(APP_VERSION).description("Replacement for Postman with Desktop, Web, CLI, TUI, and HTTP interfaces");
  cmd.globalOption("--trace", "Enable trace logging", { default: false });
  return cmd;
}
