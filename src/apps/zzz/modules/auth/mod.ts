import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import { BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { QueryAuthorizer } from "./query.ts";
import { Action } from "../../../../lib/lib.ts";
import { Model } from "../../../../storage/mod.ts";

export class AuthenticationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule.constructor.name];
  models = [Authentication.constructor.name];
  fields = {
    Authentication: Authentication,
  };
  async modify(model: Model, action: Action): Promise<void> {
    if (AuthenticationModule.hasFields(model) && model instanceof HttpRequest) {
      let auth = (model as any).Authentication as Authentication;
      if (typeof auth === "string") {
        auth = await this.app.store.get(Authentication.constructor.name, auth) as Authentication; // TODO Why is this a never????
      }
      const authType = "BasicAuth"; // TODO: Somehow get root key?
      const authorizer = this.newAuthentication(authType);
      return await authorizer.authorize(model, auth);
    }
  }
  private newAuthentication(type: string): IAuthorizer {
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
        throw new Error(`Unknown authentication type: $type`);
    }
  }
}
export interface IAuthorizer {
  authorize(model: HttpRequest, data: AuthContents): void;
}
export type AuthContents = {};

export class Authentication extends Model {
  [key: string]: AuthContents;
}
