import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../stores/storage/mod.ts";

export class RedactModule extends Module implements IModuleModifier, IModuleFeatures {
  Name = "Redact";
  dependencies = [];
  features = [{
    hidden: true,
    name: "redact",
    description: "Redact fields from being included in the response",
    type: "string[]",
  } as Feature];
  modify(entity: Model, action: Action): Promise<void> {
    Trace("RedactModule:modify");
    if (!action.features.all && !action.features.execute) {
      for (const key of Object.keys(this.app.features)) {
        delete asAny(entity)[key];
      }
      if ("Variables" in entity) {
        delete entity.Variables;
      }
    }
    if (!action.features.execute) {
      if ("Cookies" in entity) {
        delete entity.Cookies;
      }
    }
    return Promise.resolve();
  }
}
