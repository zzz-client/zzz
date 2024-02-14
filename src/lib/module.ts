import { IStore, Model } from "../storage/mod.ts";
import { Action, asAny } from "./etc.ts";

export abstract class Module {
  Name?: string;
  store: IStore;
  abstract dependencies: string[];
  constructor(store: IStore) {
    this.store = store;
  }
  static hasFields(model: Model, fields: string[]): boolean {
    for (const key of fields) {
      if (!(key in model)) {
        return false;
      }
    }
    return true;
  }
}
export interface IModuleFeatures {
  features: Feature[];
}
export interface IModuleModels {
  models: string[];
}
export interface IModuleFields {
  fields: ModuleFields;
}
export interface IModuleRenderer {
  // deno-lint-ignore no-explicit-any
  render(model: Model, action: Action): Promise<any>; //TODO
}
export interface IModuleModifier {
  modify(model: Model, action: Action): Promise<void>;
}
export interface ModuleFields {
  [key: string]: ModuleField;
}
export interface ModuleField {
  // deno-lint-ignore no-explicit-any
  [key: string]: any; // TODO?
}
export type Feature = {
  name: string;
  description: string;
  type: "string" | "boolean" | "string[]";
  default?: string | boolean;
  argument?: string;
  alias?: string;
  hidden?: boolean;
};

// ----------------------------------------- TESTS -----------------------------------------

import { describe, fail, it } from "./tests.ts";

describe("Module", () => {
  describe("hasFields", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
});
