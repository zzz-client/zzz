import { Args, Command } from "./deps.ts";
import { Action, asAny, StringToStringMap, Trace } from "./etc.ts";
import { IModuleModifier, Module } from "./module.ts";
import { IStore, Model } from "./storage/mod.ts";

export default interface IApplication {
  flags: Flags;
  cmd: Command;
  argv: Args;
  env: StringToStringMap;
  modules: Module[];
  store: IStore;
  // renderers: IModuleRenderer[];
  registerModule(module: Module): void;
  run(): Promise<void>;
}
export type ConfigValue = string | boolean | number;

export type Flags = {
  _: Array<string | number>;
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
export function executeHooks(hookIdentifier: string, model: Model, _actionOrExecuteResponse: unknown): Promise<void> {
  const hooks = asAny(model).Hooks as StringToStringMap;
  if (hooks && hookIdentifier in hooks) {
    // const hook = hooks[hookIdentifier] as string;
    // TODO: Execute hook
  }
  return Promise.resolve();
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "./tests.ts";

describe("executeModules", () => {
  it("works", async () => {
    // fail("Write this test");
  });
});
