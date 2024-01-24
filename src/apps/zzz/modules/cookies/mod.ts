import { Action, StringToStringMap } from "../../../../lib/lib.ts";
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
    console.log("cookies", model);
    // if (!action.features["no-cookies"] && action.features.execute && model instanceof HttpRequest) {
    await this.loadCookies(model);
    // }
  }
  private async loadCookies(theRequest: HttpRequest): Promise<void> {
    const cookieId = new URL(theRequest.URL).host;
    const cookies = await this.app.store.get(Cookies.name, cookieId) as Cookies;
    if (cookies) {
      theRequest.Headers.Cookie = this.getHeaderString(cookies);
    }
    return Promise.resolve();
  }
  private getHeaderString(cookies: Cookies): string {
    let header = "";
    for (const cookieName of Object.keys(cookies.Cookies).sort()) {
      if (cookieName !== "domain") {
        header += `${cookieName}=${cookies.Cookies[cookieName]}; `;
      }
    }
    return header;
  }
}
export class Cookies extends Model {
  Cookies!: StringToStringMap; // TODO: Ideally this would not need another nested level but unsure if that's possible or actually really good
}
