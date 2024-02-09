import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";
import DI, { newInstance as iNewInstance } from "../../../../lib/di.ts";
import { StringToStringMap } from "../../../../lib/etc.ts";
import { IModuleRenderer, Module } from "../../../../lib/module.ts";
import IApplication, { ConfigValue, Flags, loadFlagsAndFeatures } from "../../../mod.ts";
import Cli from "./cli.ts";

import { AuthorizationModule } from "../../modules/auth/mod.ts";
import { BodyModule } from "../../modules/body/mod.ts";
import { ContextModule } from "../../modules/context/mod.ts";
import { CookiesModule } from "../../modules/cookies/mod.ts";
import { PathParamsModule } from "../../modules/path-params/mod.ts";
import { RedactModule } from "../../modules/redact/mod.ts";
import { RequestsModule } from "../../modules/requests/mod.ts";
import TemplateModule from "../../modules/template/mod.ts";
import { IStore } from "../../stores/mod.ts";

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
    string: [],
    boolean: ["trace"] as string[],
    description: {} as StringToStringMap,
    argument: {} as StringToStringMap,
    default: {} as { [key: string]: ConfigValue },
    alias: {} as StringToStringMap,
  } as Flags;
  argv: Args;
  env = {} as StringToStringMap;
  loadedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    this.env = Deno.env.toObject();
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
    return Cli(this);
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
