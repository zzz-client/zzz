import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";
import DI, { newInstance as iNewInstance } from "../../lib/di.ts";
import { Action, StringToStringMap, Trace } from "../../lib/lib.ts";
import { IModuleFeatures, IModuleModifier, IModuleRenderer, Module } from "../../lib/module.ts";
import { Model } from "../../storage/mod.ts";
import IApplication, { ConfigValue, FeatureMap, Flags } from "../mod.ts";
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
import * as FileStorage from "../../storage/files/mod.ts";

DI.register("IAuthorizer", BasicAuthAuthorizer.newInstance, "BasicAuth");
DI.register("IAuthorizer", BearerTokenAuthorizer.newInstance, "BearerToken");
DI.register("IAuthorizer", HeaderAuthorizer.newInstance, "HeaderAuthorizer");
DI.register("IAuthorizer", QueryAuthorizer.newInstance, "QueryAuthorizer");
DI.register("IStore", FileStore.newInstance);
DI.register("IStorage:HttpRequest", FileStorage.newInstance, ["request", "yml"]);
DI.register("IStorage:Scope", FileStorage.newInstance, ["request", "yml"]);
DI.register("IStorage:Collection", FileStorage.newInstance, ["request", "yml"]);
DI.register("IStorage:Context", FileStorage.newInstance, ["contexts", "yml"]);
DI.register("IStorage:Authorization", FileStorage.newInstance, ["auth", "yml"]);
DI.register("IStorage:Cookies", FileStorage.newInstance, ["cookies", "yml"]);

const newInstance = {
  newInstance(): Object {
    return new Application();
  },
} as iNewInstance;
export { newInstance };

const STANDARD_FLAGS = {
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
};

export default class Application implements IApplication {
  store = DI.newInstance("IStore") as IStore;
  flags = {
    preamble: "Usage: zzz <options>",
    ...STANDARD_FLAGS,
  } as Flags;
  argv?: Args; // TODO: Should not be optional but needs to wait to be loaded until after registerModule has been called
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
    this.registerModule(new ScopeModule(this));
    this.registerModule(new ContextModule(this));
    this.registerModule(new AuthorizationModule(this));
    this.registerModule(new TemplateModule(this));
    this.registerModule(new CookiesModule(this));
    this.registerModule(new RedactModule(this));
    this.argv = processFlags(Deno.args, this.flags);
  }

  // if (app.argv._.includes("run")) {
  //   Trace("Running CLI");
  //   return Cli(app);
  // }
  // if (
  //   app.argv.all ||
  //   app.argv.execute ||
  //   app.argv.format
  // ) {
  //   if (app.argv.all) Trace("--all not allowed");
  //   if (app.argv.execute) Trace("--execute not allowed");
  //   if (app.argv.format) Trace("--format not allowed");
  //   throw new Error("Flags not allowed when starting HTTP or Web server");
  // }
  // if (app.argv._.includes("web")) {
  //   Log("Starting web server");
  //   Deno.args.splice(2);
  //   // vite;
  //   Deno.exit(0);
  //   // TODO
  // }
  // if (app.argv._.includes("http")) {
  //   Log("Starting HTTP server");
  //   return new Server(app).listen();
  // }
  // Log(":)");
  registerModule(module: Module): void {
    this.loadFlags(module);
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
  executeModules(action: Action, model: Model): Promise<void> {
    let promises = Promise.resolve();
    Trace("Executing modules for", model);
    this.modules.forEach((module) => {
      Trace("Enqueuing module", module.Name);
      if ("modify" in module) {
        promises = promises.then(() => {
          Trace("Executing module", module.Name);
          return (module as unknown as IModuleModifier).modify(model, action);
        });
        return Promise.resolve();
      }
    });
    return promises;
  }
  private loadFlags(module: Module) {
    // TODO: Check dependencies via executedModules
    if ("features" in module) { // TODO: IModuleFeatures
      Trace("Loading flags for", module.Name);
      for (const flag of (module as unknown as IModuleFeatures).features) {
        this.flags[flag.type].push(flag.name);
        this.flags.description[flag.name] = flag.description;
        if (flag.argument) this.flags.argument[flag.name] = flag.argument;
        if (flag.alias) this.flags.alias[flag.name] = flag.alias;
        if (flag.default) this.flags.default[flag.name] = flag.default;
      }
    }
  }
}
