import { Action, Trace } from "../../../../lib/lib.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import { BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { QueryAuthorizer } from "./query.ts";

export class AuthorizationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule.constructor.name, ContextModule.constructor.name];
  models = [Authorization.constructor.name];
  fields = {
    Authorization: Authorization,
    HttpRequest: ChildAuthorization,
  };
  async modify(model: Model, action: Action): Promise<void> {
    Trace("AuthorizationModule:modify");
    if (AuthorizationModule.hasFields(model) && model instanceof HttpRequest) {
      Trace("Has Authorization");
      let auth = (model as any).Authorization;
      if (auth === undefined) {
        Trace("Authorization is undefined, aborting");
        return;
      }
      if (typeof auth === "string") {
        Trace("Loading stored Authorization:", auth);
        auth = await this.app.store.get(Authorization.name, auth) as Authorization; // TODO Why is this a never????
      }
      Trace("Authorization:", Authorization);
      if (action.features.all) {
        Trace("Setting Authorization attribute on Model");
        (model as any).Authorization = auth;
      }
      if (action.features.execute) { // TODO: Should this be for format too? if so does this module depend on template? that seems backwards??? Maybe dependencies should only be those that are required, but then how does this class state that it knows about Template?
        Trace("Executing");
        const authType = Object.keys(auth)[0];
        Trace("AuthType:", authType);
        auth = auth[authType] as Authorization;
        Trace("Authorization:", Authorization);
        const authorizer = newAuthorization(authType);
        Trace("Authorizer", authorizer);
        return authorizer.authorize(model, auth);
      }
      return Promise.resolve();
    }
  }
}

function newAuthorization(type: string): IAuthorizer {
  switch (type) {
    case "BearerToken":
      return new BearerTokenAuthorizer();
    case "BasicAuth":
      return new BasicAuthAuthorizer();
    case "Header":
      return new HeaderAuthorizer();
    case "Query":
      return new QueryAuthorizer();
    default:
      throw new Error(`Unknown Authorization type: $type`);
  }
}
export interface IAuthorizer {
  authorize(model: Model, data: AuthContents): void;
}
export type AuthContents = {};

export class Authorization extends Model {
  [key: string]: AuthContents | Authorization;
}
class ChildAuthorization {
  Authorization?: Authorization | string;
}

import { assertEquals } from "../../../../lib/tests.ts";
Deno.test("newAuthorization: BasicAuth", () => {
  // GIVEN
  const type = "BasicAuth";
  // WHEN
  const authorization = newAuthorization(type);
  // THEN
  assertEquals(authorization instanceof BasicAuthAuthorizer, true, "Incorrect authorization type");
});

Deno.test("newAuthorization: BearerToken", () => {
  // GIVEN
  const type = "BearerToken";
  // WHEN
  const authorization = newAuthorization(type);
  // THEN
  assertEquals(authorization instanceof BearerTokenAuthorizer, true, "Incorrect authorization type");
});

Deno.test("newAuthorization: Header", () => {
  // GIVEN
  const type = "Header";
  // WHEN
  const authorization = newAuthorization(type);
  // THEN
  assertEquals(authorization instanceof HeaderAuthorizer, true, "Incorrect authorization type");
});

Deno.test("newAuthorization: Query", () => {
  // GIVEN
  const type = "Query";
  // WHEN
  const authorization = newAuthorization(type);
  // THEN
  assertEquals(authorization instanceof QueryAuthorizer, true, "Incorrect authorization type");
});

Deno.test("newAuthorization: Unknown", () => {
  // GIVEN
  const type = "asdf";
  try {
    // WHEN
    const authorization = newAuthorization(type);
    // THEN
  } catch (e) {
    assertEquals(e.message, `Unknown Authorization type: $type`, "Incorrect error message");
  }
});
