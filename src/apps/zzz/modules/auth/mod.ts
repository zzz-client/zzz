import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { IStore, Model } from "../../../../storage/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class AuthorizationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  Name = "Authorization";
  dependencies = [RequestsModule.name, ContextModule.name];
  models = [Authorization.name];
  fields = {
    Authorization: Authorization,
    HttpRequest: ChildAuthorization,
  };
  async modify(model: Model, action: Action): Promise<void> {
    Trace("AuthorizationModule:modify");
    if (AuthorizationModule.hasFields(model) && model instanceof HttpRequest) {
      Trace("Has Authorization");
      let auth = asAny(model).Authorization as Authorization;
      if (typeof auth === "string") {
        Trace("Authorization is undefined, aborting");
        auth = await this.store.get(Authorization.name, auth) as Authorization;
      }
      if (typeof auth === "string") {
        Trace("Loading stored Authorization:", auth);
        auth = await this.store.get(Authorization.name, auth) as Authorization;
      }
      Trace("Authorization:", Authorization);
      if (action.features.all) {
        Trace("Setting Authorization attribute on Model");
        asAny(model).Authorization = auth;
      }
      if (action.features.execute) { // TODO: Should this be for format too? if so does this module depend on template? that seems backwards??? Maybe dependencies should only be those that are required, but then how does this class state that it knows about Template?
        Trace("Executing");
        const authType = Object.keys(auth)[0];
        Trace("AuthType:", authType);
        auth = auth[authType] as Authorization;
        Trace("Authorization:", Authorization);
        const authorizer = DI.newInstance("IAuthorizer", authType) as IAuthorizer;
        Trace("Authorizer", authorizer);
        return authorizer.authorize(model, auth);
      }
      return Promise.resolve();
    }
  }
}

Deno.test("Authorization Module modify: undefined", async () => {
  mockApp();
  // GIVEN
  const module = new AuthorizationModule(DI.getInstance("IStore") as IStore);
  const action = new Action({}, {});
  const model = new Model();
  // WHEN
  await module.modify(model, action);
  // THEN
  assertEquals(asAny(model).Authorization, undefined, "Authorization should be undefined");
});

Deno.test("Authorization Module modify: string", async () => {
  mockApp();
  // GIVEN
  const module = new AuthorizationModule(DI.getInstance("IStore") as IStore);
  const action = new Action({}, {});
  const model = new Model();
  asAny(model).Authorization = "asdf";
  // TODO: Somehow mock testApp().store
  // WHEN
  await module.modify(model, action);
  // THEN
  assertEquals(asAny(model).Authorization, "asdf", "Authorization should be string it was set to");
});
export interface IAuthorizer {
  authorize(model: Model, data: AuthContents): void;
}
// deno-lint-ignore ban-types
export type AuthContents = {}; // TODO

export class Authorization extends Model {
  [key: string]: AuthContents | Authorization;
}
class ChildAuthorization {
  Authorization?: Authorization | string;
}

import DI from "../../../../lib/di.ts";
import { assertEquals, mockApp } from "../../../../lib/tests.ts";
import IApplication from "../../../mod.ts";
