import Application from "../core/app.ts";
import { Model } from "../core/yeet.ts";

export abstract class Module {
  app: Application;
  abstract dependencies: (typeof Module)[];
  constructor(app: Application) {
    this.app = app;
  }
  static hasFields(model: Model): boolean {
    if (!("fields" in this)) {
      return false;
    }
    for (const key of Object.keys((this as any).fields)) {
      if (!(key in model)) {
        return false;
      }
    }
    return true;
  }
}
export interface IModuleFlags {
  flags: Flag[];
}
export interface IModuleModels {
  models: (typeof Model)[];
}
export interface IModuleFields {
  fields: ModuleFields;
}
export interface IModuleRenderer {
  render(model: Model): Promise<void>;
}
export interface IModuleModifier {
  modify(model: Model): Promise<void>;
}

export interface ModuleFields {
  [key: string]: ModuleField;
}
export interface ModuleField {
  [key: string]: any;
}

export type Flag = {
  name: string;
  description: string;
  type: "string" | "boolean";
  argument?: string;
  alias?: string;
  default?: any;
  exposed?: boolean;
};
