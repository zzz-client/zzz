import DI from "../../../../lib/di.ts";
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
    HttpRequest: Authorization,
  };
  async modify(model: Model, action: Action): Promise<void> {
    Trace("AuthorizationModule:modify");
    if (!Module.hasFields(model, ["Authorization"])) {
      return;
    }

    Trace("Has Authorization");
    let auth = asAny(model).Authorization as Authorization;
    if (!auth) {
      Trace("Authorization is undefined, aborting");
      return Promise.resolve();
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
      this.execute(model, auth);
    }
    return Promise.resolve();
  }
  // deno-lint-ignore no-explicit-any
  private execute(model: Model, auth: any): void {
    Trace("Executing");
    const authType = Object.keys(auth)[0];
    Trace("AuthType:", authType);
    auth = auth[authType] as Authorization;
    Trace("Authorization:", Authorization);
    const authorizer = DI.newInstance("IAuthorizer", authType) as IAuthorizer;
    Trace("Authorizer", authorizer);
    authorizer.authorize(model, auth);
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
// deno-coverage-ignore
class ChildAuthorization {
  Authorization?: Authorization | string;
}

// ----------------------------------------- TESTS -----------------------------------------
import { describe, it } from "https://deno.land/std/testing/bdd.ts";
import { assertSpyCall, resolvesNext, stub } from "https://deno.land/x/mock/mod.ts";
import { assertEquals, TestStore } from "../../../../lib/tests.ts";

describe("Authorization Module ", () => {
  describe("modify", () => {
    it("does nothing if the model does not have the module fields", async () => {
      const testRequest = new HttpRequest();
      // GIVEN
      const module = new AuthorizationModule(new TestStore());
      const action = new Action({}, {});
      // WHEN
      await module.modify(testRequest, action);
      // THEN
      assertEquals(asAny(testRequest).Authorization, undefined, "Authorization should be undefined");
    });
    it("returns nothing when .Authorization is undefined", async () => {
      const testStore = new TestStore();
      const testRequest = new HttpRequest();
      asAny(testRequest).Authorization = undefined;
      // GIVEN
      const module = new AuthorizationModule(testStore);
      const action = new Action({}, {});
      // WHEN
      await module.modify(testRequest, action);
      // THEN
      assertEquals(asAny(testRequest).Authorization, undefined, "Authorization should be undefined");
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
    it("does nothing when .Authorization is already complex object", async () => {
      const testStore = new TestStore();
      const testRequest = new HttpRequest();
      const getStub = stub(testStore, "get", resolvesNext([testRequest]));
      // GIVEN
      const module = new AuthorizationModule(testStore);
      const action = new Action({}, {});
      asAny(testRequest).Authorization = { BearerToken: "asdf" };
      // WHEN
      await module.modify(testRequest, action);
      // THEN
      assertEquals(asAny(testRequest).Authorization, { BearerToken: "asdf" }, "Authorization should be string it was set to");
      getStub.restore();
    });
  });
});
