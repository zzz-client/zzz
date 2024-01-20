import { IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, IModuleRenderer, Module } from "./module.ts";
import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { Model, StringToStringMap } from "./yeet.ts";
import { load as loadEnv } from "https://deno.land/std/dotenv/mod.ts";
import Action from "./action.ts";

export type ConfigValue = string | boolean | number;

type Flags = {
  preamble: string;
  string: string[];
  boolean: string[];
  description: StringToStringMap;
  argument: { [key: string]: string };
  default: { [key: string]: any };
  alias: StringToStringMap;
};

type FeatureMap = { [key: string]: ConfigValue };

export interface IStore {
  get(type: typeof Model, name: string): Promise<Model>;
  // deno-lint-ignore no-explicit-any
  set(type: typeof Model, name: string, value: any): Promise<void>;
}

export default class Application {
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
  executeModules(action: Action, model: Model): void {
    for (const module of this.modules) {
      (module as unknown as IModuleModifier).modify(model, action);
    }
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
