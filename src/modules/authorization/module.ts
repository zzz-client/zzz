import { BasicAuth, BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { Query, QueryAuthorizer } from "./query.ts";
import { IAuthorizer } from "../../core/app.ts";
import { IModuleModifier, Module } from "../module.ts";
import { RequestsModule } from "../requests/module.ts";
import { Model } from "../../core/yeet.ts";

export function HasAuthorization(model: Model): boolean {
  return "Authorization" in model;
}
export interface IAuthorizer {
  authorize(model: Model, authorizationConfig: Auth): void;
}

export default class AuthorizationModule extends Module implements IModuleModifier {
  dependencies = [RequestsModule];
  async modify(theModel: Model): Promise<void> {
    if (AuthorizationModule.hasFields(theModel)) {
      const authConfig = await (await this.app.getStore()).get( //TODO: store.get
        ModelType.Authorization,
        (theModel as any).Authorization.Type,
      ) as any;
      const injection = this.newAuthorization(authConfig.Type);
      return await injection.authorize(theModel, authConfig);
    }
  }
  newAuthorization(type: string): IAuthorizer {
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
interface Auth {
  Type: string;
}
export interface BearerTokenAuth extends Auth {
  BearerToken: string;
}
export interface BasicAuthAuth extends Auth {
  BasicAuth: BasicAuth;
}
export interface HeaderAuth extends Auth {
  Header: HeaderAuth;
}
export interface QueryAuth extends Auth {
  Query: Query;
}
