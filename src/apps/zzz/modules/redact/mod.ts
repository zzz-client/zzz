import { IModuleModifier, Module } from "../../../../lib/module.ts";
import { CookiesModule } from "../cookies/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { Action } from "../../../../lib/lib.ts";
import { Model } from "../../../../stores/files/store.ts";

export class RedactModule extends Module implements IModuleModifier {
  dependencies = [ContextModule, CookiesModule];
  modify(entity: Model, action: Action): Promise<void> {
    if (!action.feature.full) {
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
