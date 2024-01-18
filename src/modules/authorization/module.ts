import { Model } from "../../core/yeet.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module } from "../module.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";
import { BasicAuthAuthorizer } from "./basicAuth.ts";
import { BearerTokenAuthorizer } from "./bearerToken.ts";
import HeaderAuthorizer from "./header.ts";
import { QueryAuthorizer } from "./query.ts";

export default class AuthorizationModule extends Module implements IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [RequestsModule];
  models = [Authentication];
  fields = {
    Authentication: Authentication,
  };
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

export class Authentication extends Model {
  [key: string]: AuthType;
}
