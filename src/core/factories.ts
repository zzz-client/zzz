import ClientActor from "./actors/client.ts";
import CurlActor from "./actors/curl.ts";
import PassThruActor from "./actors/pass.ts";
import SummaryActor from "./actors/summary.ts";
import BasicAuthAuthorizer from "./authorizers/basicAuth.ts";
import BearerTokenAuthorizer from "./authorizers/bearerToken.ts";
import HeaderAuthorizer from "./authorizers/header.ts";
import QueryAuthorizer from "./authorizers/query.ts";
import ZzzRequest from "./request.ts";
import { EntityType, Get } from "./storage.ts";
import FileStore from "./stores/file.ts";
import PostmanStore from "./stores/postman.ts";

export interface Stats {
  Type: string;
  Name: string;
  Size: number;
  Created: Date;
  Modified: Date;
}
export const Stores = {
  JSON: new FileStore("json"),
  YAML: new FileStore("yml"),
  XML: new FileStore("xml"),
  Postman: new PostmanStore("PostmanCollection.json"),
};
// Interfaces
export interface IActor {
  act(theRequest: ZzzRequest): Promise<any>;
}
export interface IAuthorization {
  apply(theRequest: ZzzRequest, authorizationConfig: any): void;
}
export interface IStore {
  get(entityType: EntityType, entityName: string, environmentName: string | null): Promise<any>;
  store(key: string, value: any, environmentName: string): Promise<void>;
  stat(entityName: string): Promise<Stats>;
}
// Facade methods
export async function Act(theRequest: ZzzRequest, actorName: string): Promise<any> {
  return await newActor(actorName).act(theRequest);
}
export function Authorize(theRequest: ZzzRequest, authorizationDefinition: string): void {
  if (authorizationDefinition) {
    const authConfig = Get(
      EntityType.Authorization,
      authorizationDefinition,
      null,
    ) as any; // TODO: any
    const authType = extractAuthType(authConfig);
    const authValues = authConfig[authType];
    const injection = newAuthorization(authType);
    injection.apply(theRequest, authValues);
  }
}
// Factories
const storeInstance: IStore = Stores.YAML; // TODO: Make dynamic somehow
export function newStore(): IStore {
  return storeInstance;
}
function newActor(type: string): IActor {
  switch (type) {
    default:
    case "Client":
      return new ClientActor();
    case "Summary":
      return new SummaryActor();
    case "Curl":
      return new CurlActor();
    case "Pass":
      return new PassThruActor();
  }
}
function newAuthorization(type: string): IAuthorization {
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
// Helpers
function extractAuthType(authorizationDefinition: any): string {
  const authType = Object.keys(authorizationDefinition);
  if (authType.length !== 1) {
    throw new Error("Unable to detect auth type");
  }
  return authType[0];
}
