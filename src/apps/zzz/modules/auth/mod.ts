import { describe, it } from "https://deno.land/std/testing/bdd.ts";
import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
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
    if (AuthorizationModule.hasFields(model)) {
      Trace("Has Authorization");
      let auth = asAny(model).Authorization as Authorization;
      if (!auth) {
        Trace("Authorization is undefined, aborting");
        return Promise.resolve();
      }
      if (typeof auth === "string") {
        Trace("Looking up Authorization profile:", auth);
        auth = await this.store.get(Authorization.name, auth) as Authorization;
      }
      if (typeof auth === "string") {
        Trace("Loading stored Authorization:", auth);
        auth = await this.store.get(Authorization.name, auth) as Authorization;
      }
      Trace("Authorization:", auth);
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

describe("Authorization Module ", () => {
  describe("modify", () => {
    it("returns nothing when .Authorization is undefined", async () => {
      const testStore = new TestStore();
      const testRequest = new HttpRequest();
      asAny(testRequest).Authorization = undefined;
      // GIVEN
      const module = new AuthorizationModule(testStore);
      const action = new Action({}, {});
      const model = new Model();
      // WHEN
      await module.modify(model, action);
      // THEN
      assertEquals(asAny(model).Authorization, undefined, "Authorization should be undefined");
    });
    it("loads a profile when .Authorization is a string", async () => {
      const testStore = new TestStore();
      const testRequest = new HttpRequest();
      const getStub = stub(testStore, "get", resolvesNext([testRequest]));
      // GIVEN
      const module = new AuthorizationModule(testStore);
      const action = new Action({}, {});
      asAny(testRequest).Authorization = "asdf";
      // WHEN
      await module.modify(testRequest, action);
      // THEN
      assertEquals(asAny(testRequest).Authorization, "asdf", "Authorization should be string it was set to");
      assertSpyCall(getStub, 0, {
        args: ["Authorization", "asdf"],
        returned: Promise.resolve(testRequest),
      });
      getStub.restore();
    });
  });
});

import DI from "../../../../lib/di.ts";
import { assertEquals, TestStore } from "../../../../lib/tests.ts";
import { assertSpyCall, resolvesNext, spy, stub } from "https://deno.land/x/mock/mod.ts";
import { assertSpyCalls } from "https://deno.land/x/mock@0.15.2/asserts.ts";
