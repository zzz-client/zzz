import { Action } from "../../../../lib/lib.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class CookiesModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule.constructor.name];
  models = [Cookies.constructor.name];
  fields = {
    Request: {
      cookies: Cookies,
    },
  };
  async modify(model: Model, action: Action): Promise<void> {
    if (action.features["no-cookies"] && model instanceof HttpRequest) {
      await this.loadCookies(model);
    }
  }
  private loadCookies(theRequest: HttpRequest): Promise<void> {
    // TODO loadCookies
    return Promise.resolve();
  }
}
export class Cookies extends Model {
  [key: string]: string;
}
