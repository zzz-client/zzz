import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import { BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { QueryAuthorizer } from "./query.ts";
import { Action } from "../../../../lib/lib.ts";
import { Model } from "../../../../storage/mod.ts";

export class AuthorizationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule.constructor.name];
  models = [Authorization.constructor.name];
  fields = {
    Authorization: Authorization,
  };
  async modify(model: Model, action: Action): Promise<void> {
    if (AuthorizationModule.hasFields(model) && model instanceof HttpRequest) {
      let auth = (model as any).Authorization;
      console.log("!", auth, model);
      if (auth === undefined) {
        return;
      }
      if (typeof auth === "string") {
        auth = await this.app.store.get(Authorization.name, auth) as Authorization; // TODO Why is this a never????
      }
      // if (action.features.all) {
      (model as any).Authorization = auth;
      // }
      if (action.features.all || action.features.execute) {
        const authType = "BearerToken"; // TODO: Somehow get root key?
        console.log(auth);
        auth = auth[authType] as Authorization;
        const authorizer = this.newAuthorization(authType);
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
export type AuthContents = {};

export class Authorization extends Model {
  [key: string]: AuthContents | Authorization;
}
