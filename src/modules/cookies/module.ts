import { Model, StringToStringMap } from "../../core/yeet.ts";
import { Flag, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../module.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";

export class CookiesModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule];
  flags: Flag[] = [
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
  async modify(model: Model): Promise<void> {
    if (this.app.feature["no-cookies"]) {
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
