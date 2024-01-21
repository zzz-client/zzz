import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { load as loadEnv } from "https://deno.land/std/dotenv/mod.ts";
import { Action, StringToStringMap } from "../../lib/lib.ts";
import { IModuleFeatures, IModuleModifier, IModuleRenderer, Module } from "../../lib/module.ts";
import { Model } from "../../storage/mod.ts";
import IApplication, { ConfigValue, FeatureMap, Flags } from "../mod.ts";
import FileStore from "./stores/files.ts";

export default class Application implements IApplication {
  store = new FileStore();
  flags = {
    preamble: "Usage: zzz <options>",
    string: ["http", "web"],
    boolean: [] as string[],
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
  argv?: Args; // TODO: Should not be optional but needs to wait to be loaded until after registerModule has been called
  feature = {} as FeatureMap;
  env = {} as StringToStringMap;
  loadedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    loadEnv().then((env) => this.env = env);
  }
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
    const promises = Promise.resolve();
    this.modules.forEach((module) => {
      promises.then(() => {
        if ("modify" in module) {
          (module as unknown as IModuleModifier).modify(model, action);
        }
      });
    });
    console.log("executing", this.modules.length, "promises");
    return promises;
  }
  private loadFlags(module: Module) {
    // TODO: Check dependencies via executedModules
    if ("features" in module) { // TODO: IModuleFeatures
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
