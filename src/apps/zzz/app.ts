import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";
import DI, { newInstance as iNewInstance } from "../../lib/di.ts";
import { Log, StringToStringMap, Trace } from "../../lib/etc.ts";
import { IModuleRenderer, Module } from "../../lib/module.ts";
import * as FileStorage from "../../storage/files/mod.ts";
import IApplication, { ConfigValue, FeatureMap, Flags, loadFlagsAndFeatures } from "../mod.ts";
import Cli from "./interfaces/cli.ts";
import { Server } from "./interfaces/http.ts";
import * as BasicAuthAuthorizer from "./modules/auth/basicAuth.ts";
import * as BearerTokenAuthorizer from "./modules/auth/bearerToken.ts";
import * as HeaderAuthorizer from "./modules/auth/header.ts";
import { AuthorizationModule } from "./modules/auth/mod.ts";
import * as QueryAuthorizer from "./modules/auth/query.ts";
import { BodyModule } from "./modules/body/mod.ts";
import { ContextModule } from "./modules/context/mod.ts";
import { CookiesModule } from "./modules/cookies/mod.ts";
import { PathParamsModule } from "./modules/path-params/mod.ts";
import { RedactModule } from "./modules/redact/mod.ts";
import { RequestsModule } from "./modules/requests/mod.ts";
import { ScopeModule } from "./modules/scope/mod.ts";
import TemplateModule from "./modules/template/mod.ts";
import * as FileStore from "./stores/files.ts";
import { IStore } from "./stores/mod.ts";

// deno-fmt-ignore
{
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

const newInstance = {
  newInstance(): object {
    return new Application();
  },
} as iNewInstance;
export { newInstance };

export default class Application implements IApplication {
  store = DI.newInstance("IStore") as IStore;
  flags = {
    preamble: "Usage: zzz <options>",
    string: ["http", "web"],
    boolean: ["trace"] as string[],
    description: {
      http: "Start HTTP server",
      web: "Start web UI server",
    } as StringToStringMap,
    argument: {
      http: "port",
      web: "port",
    } as StringToStringMap,
    default: {} as { [key: string]: ConfigValue },
    alias: {} as StringToStringMap,
  } as Flags;
  argv: Args;
  features = {} as FeatureMap;
  env = {} as StringToStringMap;
  loadedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    // loadEnv().then((env) => this.env = env);
    this.registerModule(new RequestsModule(this));
    this.registerModule(new BodyModule(this));
    this.registerModule(new PathParamsModule(this));
    // this.registerModule(new ScopeModule(this));
    this.registerModule(new ContextModule(this));
    this.registerModule(new AuthorizationModule(this));
    this.registerModule(new TemplateModule(this));
    this.registerModule(new CookiesModule(this));
    this.registerModule(new RedactModule(this));
    this.argv = processFlags(Deno.args, this.flags);
  }
  run(): Promise<void> {
    // if (this.argv._.includes("run")) {
    //   Trace("Running CLI");
    //   return Cli(this);
    // }
    if (
      this.argv.all ||
      this.argv.execute ||
      this.argv.format
    ) {
      if (this.argv.all) Trace("--all not allowed");
      if (this.argv.execute) Trace("--execute not allowed");
      if (this.argv.format) Trace("--format not allowed");
      throw new Error("Flags not allowed when starting HTTP or Web server");
    }
    if (this.argv._.includes("web")) {
      Log("Starting web server");
      Deno.args.splice(2);
      // start vite somehow
      Deno.exit(0);
    }
    console.log(this.argv._);
    if (this.argv._.includes("http")) {
      Log("Starting HTTP server");
      return new Server(this).listen();
    }
    Log(":)");
    return Promise.resolve();
  }
  registerModule(module: Module): void {
    loadFlagsAndFeatures(this, module);
    /*
    if (module instanceof IModuleModels) {
      // TODO: IModuleModels
    }
    if (module instanceof IModuleFields) {
      // TODO: IModuleFields
    }
    if (module instanceof IModuleRenderer) {
      // TODO: IModuleRenderer
    }
    */
    this.modules.push(module);
  }
}
