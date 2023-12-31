import BasicAuthAuthorizer from "./authorizers/basicAuth.ts";
import BearerTokenAuthorizer from "./authorizers/bearerToken.ts";
import HeaderAuthorizer from "./authorizers/header.ts";
import QueryAuthorizer from "./authorizers/query.ts";
import Request from "./request.ts";
import { EntityType, Get } from "./store.ts";

export default function Authorize(theRequest: Request, authorizationDefinition: string): void {
  if (authorizationDefinition) {
    const authConfig = Get(
      EntityType.Authorization,
      authorizationDefinition,
      null,
    ) as any; // TODO: any
    const authType = extractAuthType(authConfig);
    const authValues = authConfig[authType];
    const injection = newInstance(authType);
    injection.apply(theRequest, authValues);
  }
}
export interface IAuthorization {
  apply(theRequest: Request, authorizationConfig: any): void;
}
function newInstance(type: string): IAuthorization {
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
function extractAuthType(authorizationDefinition: any): string {
  const authType = Object.keys(authorizationDefinition);
  if (authType.length !== 1) {
    throw new Error("Unable to detect auth type");
  }
  return authType[0];
}
