import { BasicAuth, BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer, { Header } from "./header.ts";
import { Query, QueryAuthorizer } from "./query.ts";
import { IModuleModifier, Module } from "../module.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";
import { Model } from "../../core/yeet.ts";

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
export interface IAuthorizer {
  authorize(model: HttpRequest, data: AuthType): void;
}
export type AuthType = {};

export type Authentication = { [key: string]: AuthType };
