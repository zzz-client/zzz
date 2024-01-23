import { IModuleModifier, Module } from "../../../../lib/module.ts";
import { CookiesModule } from "../cookies/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { Action } from "../../../../lib/lib.ts";
import { Model } from "../../../../storage/mod.ts";

export class RedactModule extends Module implements IModuleModifier {
  dependencies = [ContextModule.constructor.name, CookiesModule.constructor.name];
  modify(entity: Model, action: Action): Promise<void> {
    console.log("Redacting");
    if (!action.features.all) {
      if ("Variables" in entity) {
        delete entity.Variables;
      }
      if ("Cookies" in entity) {
        delete entity.Cookies;
      }
    }
    return Promise.resolve();
  }
}
