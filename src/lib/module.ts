import IApplication from "../apps/mod.ts";
import { Model } from "../storage/mod.ts";
import { Action, asAny } from "./etc.ts";

export abstract class Module {
  Name?: string;
  app: IApplication;
  abstract dependencies: string[];
  constructor(app: IApplication) {
    this.app = app;
  }
  static hasFields(model: Model): boolean {
    // if (!("fields" in this)) {
    //   return false;
    // }
    for (const key of Object.keys(asAny(this))) {
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
  render(model: Model, action: Action): Promise<any>; //TODO
}
export interface IModuleModifier {
  modify(model: Model, action: Action): Promise<void>;
}
export interface ModuleFields {
  [key: string]: ModuleField;
}
export interface ModuleField {
  [key: string]: any; // TODO?
}
export type Feature = {
  name: string;
  description: string;
  type: "string" | "boolean";
  default?: string | boolean;
  argument?: string;
  alias?: string;
  exposed?: boolean;
  multi?: boolean;
};
