import { processFlags } from "https://deno.land/x/flags_usage@2.0.0/mod.ts";
import { IModuleRenderer, Module } from "../modules/module.ts";
import { Args } from "https://deno.land/std/cli/parse_args.ts";

type FeatureMap = { [key: string]: boolean | string | number };
class Application {
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
    default: {
      http: 8000,
      web: 5173,
    } as { [key: string]: any },
    alias: {} as { [key: string]: string },
  } as any;
  argv: Args;
  feature = {} as FeatureMap;
  executedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    this.argv = processFlags(Deno.args, this.flags);
  }
  registerModule(module: Module): void {
    // TODO: Check dependencies via executedModules

    if (module instanceof IModuleFlags) { // TODO: IModuleFlags
      for (const flag of (module as any).flags) {
        this.flags[flag.type].push(flag.name);
        this.flags.description[flag.name] = flag.description;
        if (flag.argument) this.flags.argument[flag.name] = flag.argument;
        if (flag.alias) this.flags.alias[flag.name] = flag.alias;
        if (flag.default) this.flags.default[flag.name] = flag.default;
      }
    }
    if (module instanceof IModuleModels) {
      // TODO: IModuleModels
    }
    if (module instanceof IModuleFields) {
      // TODO: IModuleFields
    }
    if (module instanceof IModuleRenderer) {
      // TODO: IModuleRenderer
    }
    this.modules.push(module);
    this.argv = processFlags(Deno.args, this.flags);
  }
  executeModules(): void {
    for (const module of this.modules) {
      if (module instanceof IModuleModifier) {
        (module as IModuleModifier).modify(this.feature);
        this.executedModules.push(module);
      }
    }
    for (const renderer of this.renderers) {
      renderer.render("???");
    }
  }
}

export type Flag = {
  description: string;
  argument?: string;
  alias?: string;
  default?: any;
  type: "string" | "boolean";
};

export default Application;
