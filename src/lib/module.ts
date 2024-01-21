import Application from "../apps/zzz/app.ts";
import { Model } from "../storage/mod.ts";
import { Action } from "./lib.ts";

export abstract class Module {
  app: Application;
  abstract dependencies: (typeof Module)[];
  constructor(app: Application) {
    this.app = app;
  }
  static hasFields(model: Model): boolean {
    // if (!("fields" in this)) {
    //   return false;
    // }
    for (const key of Object.keys(this as any)) {
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
  models: (typeof Model)[];
}
export interface IModuleFields {
  fields: ModuleFields;
}
export interface IModuleRenderer {
  render(model: Model, action: Action): Promise<any>;
}
export interface IModuleModifier {
  modify(model: Model, action: Action): Promise<void>;
}
export interface ModuleFields {
  [key: string]: ModuleField;
}
export interface ModuleField {
  [key: string]: any;
}
export type Feature = {
  name: string;
  description: string;
  type: "string" | "boolean";
  argument?: string;
  alias?: string;
  default?: string | boolean;
  exposed?: boolean;
};
