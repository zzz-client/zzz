import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import { BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { QueryAuthorizer } from "./query.ts";
import { Action } from "../../../../lib/lib.ts";
import { Model } from "../../../../stores/files/store.ts";

export class AuthorizationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule];
  models = [Authentication];
  fields = {
    Authentication: Authentication,
  };
  async modify(model: Model, action: Action): Promise<void> {
    if (AuthorizationModule.hasFields(model) && model instanceof HttpRequest) {
      let auth = (model as any).Authorization;
      if (typeof auth === "string") {
        auth = await this.app.store.get(Authentication, auth);
      }
      const authorizer = this.newAuthorization(auth.Type);
      return await authorizer.authorize(model, auth);
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
        throw new Error(`Unknown authorization type: $type`);
    }
  }
}
export interface IAuthorizer {
  authorize(model: HttpRequest, data: AuthType): void;
}
export type AuthType = {};

export class Authentication extends Model {
  [key: string]: AuthType;
}
