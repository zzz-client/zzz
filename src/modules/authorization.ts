import BasicAuthAuthorizer from "./authorizers/basicAuth.ts";
import BearerTokenAuthorizer from "./authorizers/bearerToken.ts";
import HeaderAuthorizer from "./authorizers/header.ts";
import QueryAuthorizer from "./authorizers/query.ts";
import { ApplicationConfig, IAuthorizer, IModule } from "../core/app.ts";
import ZzzRequest from "../core/models.ts";
import { EntityType, Get } from "../core/storage.ts";

export default class AuthorizationModule implements IModule {
  config: ApplicationConfig;
  static newInstance(config: ApplicationConfig): IModule {
    return new AuthorizationModule(config);
  }
  constructor(config: ApplicationConfig) {
    this.config = config;
  }
  async mod(theRequest: ZzzRequest): Promise<void> {
    if (theRequest.Authorization) {
      const authConfig = Get(
        EntityType.Authorization,
        theRequest.Authorization.Type,
        null,
      ) as any;
      const injection = this.newAuthorization(authConfig.Type);
      return await injection.authorize(theRequest, authConfig);
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
