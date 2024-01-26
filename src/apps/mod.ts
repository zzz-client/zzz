import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { Action, asAny, StringToStringMap, Trace } from "../lib/etc.ts";
import { IModuleFeatures, IModuleModifier, Module } from "../lib/module.ts";
import { Model } from "../storage/mod.ts";
import { IStore } from "./zzz/stores/mod.ts";

export default interface IApplication {
  store: IStore; // TODO: bad, imports from zzz
  flags: Flags;
  argv?: Args; // TODO: Should not be optional but needs to wait to be loaded until after registerModule has been called
  features: FeatureMap;
  env: StringToStringMap;
  modules: Module[];
  // renderers: IModuleRenderer[];
  registerModule(module: Module): void;
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
  // TODO: Check dependencies via executedModules
  if ("features" in module) { // TODO: IModuleFeatures
    Trace("Loading flags for", module.Name);
    for (const flag of (module as unknown as IModuleFeatures).features) {
      if (flag.multi && (flag.type || flag.default || flag.argument || flag.alias)) {
        throw new Error(`Feature ${flag.name} is multi but has other properties set`);
      }
      if (flag.multi) {
        asAny(app.features)[flag.name] = [];
      } else if (flag.exposed) {
        asAny(app.flags)[flag.type].push(flag.name);
        app.flags.description[flag.name] = flag.description;
        if (flag.argument) app.flags.argument[flag.name] = flag.argument;
        if (flag.alias) app.flags.alias[flag.name] = flag.alias;
        if (flag.default) app.flags.default[flag.name] = flag.default;
      }
    }
  }
}

export function executeModules(modules: Module[], action: Action, model: Model): Promise<void> {
  let promises = Promise.resolve();
  Trace("Executing modules for", model);
  modules.forEach((module) => {
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
