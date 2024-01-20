import Action from "../../core/action.ts";
import { Model } from "../../core/yeet.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../core/module.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";

export class CookiesModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule];
  features: Feature[] = [
    {
      name: "no-cookies",
      description: "Do not load cookies",
      type: "boolean",
    },
  ];
  models = [Cookies];
  fields = {
    Request: {
      cookies: Cookies, // TODO Why error
    },
  };
  async modify(model: Model, action: Action): Promise<void> {
    if (action.feature["no-cookies"] && model instanceof HttpRequest) {
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
