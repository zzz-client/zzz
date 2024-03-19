import { Action, StringToStringMap, Trace } from "../../etc.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../module.ts";
import { IStore, Model } from "../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class CookiesModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  Name = "Cookies";
  dependencies = [RequestsModule.name];
  models = [Cookies.name];
  fields = {
    Request: {
      cookies: Cookies,
    },
  };
  async modify(model: Model, action: Action): Promise<void> {
    Trace("CookiesModule:modify");
    if (!action.features["no-cookies"] && action.features.execute && model instanceof HttpRequest) {
      await helpers.loadCookies(this.store, model);
    }
  }
}
const helpers = { loadCookies, getHeaderString, getCookieNamesToSet };
async function loadCookies(store: IStore, theRequest: HttpRequest): Promise<void> {
  const cookieId = new URL(theRequest.URL).host;
  const cookies = await store.get(Cookies.name, cookieId) as Cookies;
  if (cookies) {
    theRequest.Headers.Cookie = helpers.getHeaderString(cookies);
  }
  return Promise.resolve();
}
function getHeaderString(cookies: Cookies): string {
  let header = "";
  for (const cookieName of helpers.getCookieNamesToSet(cookies)) {
    if (cookieName !== "domain") {
      header += `${cookieName}=${cookies.Cookies[cookieName]}; `;
    }
  }
  return header;
}
function getCookieNamesToSet(cookies: Cookies): string[] {
  return Object.keys(cookies.Cookies).filter((cookieName) => cookieName !== "domain").sort();
}
export class Cookies extends Model {
  Cookies!: StringToStringMap; // TODO: Ideally this would not need another nested level but unsure if that's possible or actually really good
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "../../tests.ts";

describe("CookiesModule", () => {
  describe("modify", () => {
    it("sets header correctly", async () => {
      // fail("Write this test");
    });
  });
  describe("loadCookies", () => {
    it("sets header correctly", async () => {
      // fail("Write this test");
    });
  });
  describe("getHeaderString", () => {
    it("sets header correctly", async () => {
      // fail("Write this test");
    });
  });
});
