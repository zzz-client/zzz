import { Model } from "../../core/yeet.ts";
import { IModuleModifier, Module } from "../module.ts";
import { CookiesModule } from "../cookies/module.ts";
import { ContextModule } from "../context/module.ts";

export class RedactModule extends Module implements IModuleModifier {
  dependencies = [ContextModule, CookiesModule];
  modify(entity: Model): Promise<void> {
    if (!this.app.feature.full) {
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
