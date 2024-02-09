import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { Action, asAny, StringToStringMap, Trace } from "../lib/etc.ts";
import { IModuleFeatures, IModuleModifier, Module } from "../lib/module.ts";
import { Model } from "../storage/mod.ts";

export default interface IApplication {
  flags: Flags;
  argv: Args;
  // features: FeatureMap;
  env: StringToStringMap;
  modules: Module[];
  store: any; // TODO: IStore;
  // renderers: IModuleRenderer[];
  registerModule(module: Module): void;
  run(): Promise<void>;
}
export type ConfigValue = string | boolean | number;

export type Flags = {
  preamble: string;
  string: string[];
  boolean: string[];
  description: StringToStringMap;
  argument: { [key: string]: string };
  default: { [key: string]: ConfigValue };
  alias: StringToStringMap;
};
export type FeatureFlagValue = string | boolean | number;
export type FeatureFlags = { [key: string]: FeatureFlagValue };

export type FeatureMap = { [key: string]: ConfigValue };

export function loadFlagsAndFeatures(app: IApplication, module: Module): void {
  if ("features" in module) { // TODO: is there a better way to do this?
    Trace("Loading flags for", module.Name);
    for (const flag of (module as unknown as IModuleFeatures).features) {
      if (flag.type == "string[]") {
        if (!flag.hidden) {
          throw new Error(`List feature ${flag.name} must be hidden.`);
        }
        if (flag.default || flag.argument || flag.alias) {
          throw new Error(`List feature ${flag.name} cannot be a flag.`);
        }
        asAny(app.flags)[flag.name] = [];
      } else {
        asAny(app.flags)[flag.type].push(flag.name);
        app.flags.description[flag.name] = flag.description;
        if (flag.argument) app.flags.argument[flag.name] = flag.argument;
        if (flag.alias) app.flags.alias[flag.name] = flag.alias;
        if (flag.default) app.flags.default[flag.name] = flag.default;
      }
    }
  }
}

export async function executeModules(modules: Module[], action: Action, model: Model): Promise<void> {
  Trace("Executing modules for", model);
  for (const module of modules) {
    Trace("Enqueuing module", module.Name);
    if ("modify" in module) {
      Trace("Executing module", module.Name);
      await (module as unknown as IModuleModifier).modify(model, action);
    }
  }
}
