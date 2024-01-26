import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { Action, StringToStringMap } from "../lib/etc.ts";
import { Module } from "../lib/module.ts";
import { Model } from "../storage/mod.ts";
import { IStore } from "./zzz/stores/mod.ts";

export default interface IApplication {
  store: IStore; // TODO: bad, imports from zzz
  flags: Flags;
  argv?: Args; // TODO: Should not be optional but needs to wait to be loaded until after registerModule has been called
  features: FeatureMap;
  env: StringToStringMap;
  // modules: Module[];
  // renderers: IModuleRenderer[];
  registerModule(module: Module): void;
  executeModules(action: Action, model: Model): Promise<void>;
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
