import { processFlags } from "https://deno.land/x/flags_usage@2.0.0/mod.ts";
import { IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, IModuleRenderer, Module } from "./module.ts";
import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { Model, StringToStringMap } from "./yeet.ts";
import { load as loadEnv } from "https://deno.land/std/dotenv/mod.ts";
import Action from "./action.ts";

type FeatureMap = { [key: string]: boolean | string | number };
export default class Application {
  flags = {
    preamble: "Usage: zzz <options>",
    string: ["http", "web"],
    boolean: [] as string[],
    description: {
      http: "Start HTTP server",
      web: "Start web UI server",
    } as { [key: string]: string },
    argument: {
      http: "port",
      web: "port",
    } as { [key: string]: string },
    default: {} as { [key: string]: any },
    alias: {} as { [key: string]: string },
  } as any;
  argv: Args;
  feature = {} as FeatureMap;
  env = {} as StringToStringMap;
  executedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    this.argv = processFlags(Deno.args, this.flags);
    loadEnv().then((env) => this.env = env);
  }
  registerModule(module: Module): void {
    // TODO: Check dependencies via executedModules
    if ("feature" in module) { // TODO: IModuleFeatures
      for (const flag of (module as any).flags) {
        this.flags[flag.type].push(flag.name);
        this.flags.description[flag.name] = flag.description;
        if (flag.argument) this.flags.argument[flag.name] = flag.argument;
        if (flag.alias) this.flags.alias[flag.name] = flag.alias;
        if (flag.default) this.flags.default[flag.name] = flag.default;
      }
    }
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
    this.argv = processFlags(Deno.args, this.flags);
  }
  executeModules(action: Action, model: Model = {}): void {
    for (const module of this.modules) {
      (module as unknown as IModuleModifier).modify(model, action);
      this.executedModules.push(module);
    }
  }
}

export interface IStore {
  get(type: typeof Model, name: string): Promise<any>;
  set(type: typeof Model, name: string, value: any): Promise<void>;
}
