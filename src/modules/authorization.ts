import BasicAuthAuthorizer from "./authorizers/basicAuth.ts";
import BearerTokenAuthorizer from "./authorizers/bearerToken.ts";
import HeaderAuthorizer from "./authorizers/header.ts";
import QueryAuthorizer from "./authorizers/query.ts";
import { ApplicationConfig, IAuthorizer } from "../core/app.ts";
import Entity, { Auth } from "../core/models.ts";
import { Get, ModelType } from "../core/storage.ts";
import { IModule } from "./manager.ts";

export default class AuthorizationModule implements IModule {
  config: ApplicationConfig;
  static newInstance(config: ApplicationConfig): IModule {
    return new AuthorizationModule(config);
  }
  constructor(config: ApplicationConfig) {
    this.config = config;
  }
  async mod(theRequest: Entity): Promise<void> {
    if (theRequest.Authorization) {
      const authConfig = Get(
        ModelType.Authorization,
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

export interface BearerTokenAuth extends Auth {
  BearerToken: string;
}
export interface BasicAuthAuth extends Auth {
  BasicAuth: {
    username: string;
    password: string;
  };
}
export interface HeaderAuth extends Auth {
  Header: {
    name: string; // e.g. X-API-TOKEN
    value: string; // e.g. {{_api_token}}
  };
}
export interface QueryAuth extends Auth {
  Query: {
    name: string; // e.g. X-API-TOKEN
    value: string; // e.g. {{_api_token}}
  };
}
