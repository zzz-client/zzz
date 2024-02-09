import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { Action, StringToStringMap, Trace } from "../lib/etc.ts";
import { IModuleModifier, Module } from "../lib/module.ts";
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
