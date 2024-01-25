import { Action, asAny, Trace } from "../../../../lib/lib.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import { BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { QueryAuthorizer } from "./query.ts";

export class AuthorizationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
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
        auth = await this.app.store.get(Authorization.name, auth) as Authorization; // TODO Why is this a never????
      }
      if (typeof auth === "string") {
        Trace("Loading stored Authorization:", auth);
        auth = await this.app.store.get(Authorization.name, auth) as Authorization; // TODO Why is this a never????
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
        const authorizer = this.newAuthorization(authType);
        Trace("Authorizer", authorizer);
        return authorizer.authorize(model, auth);
      }
      return Promise.resolve();
    }
  }
  private newAuthorization(type: string): IAuthorizer {
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
}
export interface IAuthorizer {
  authorize(model: Model, data: AuthContents): void;
}
export type AuthContents = {}; // TODO

export class Authorization extends Model {
  [key: string]: AuthContents | Authorization;
}
class ChildAuthorization {
  Authorization?: Authorization | string;
}
