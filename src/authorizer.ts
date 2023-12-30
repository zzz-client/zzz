import { exit } from "process";
import Letter from "./letter";
import { Get, EntityType } from "./store";
import BearerTokenAuthorizer from "./authorizers/bearerToken";
import BasicAuthAuthorizer from "./authorizers/basicAuth";
import HeaderAuthorizer from "./authorizers/header";
import QueryAuthorizer from "./authorizers/query";

export default function Authorize(letter: Letter, authorizationDefinition: string): void {
    if (authorizationDefinition) {
        const authConfig = Get(EntityType.Authorization, authorizationDefinition, null);
        const authType = extractAuthType(authConfig);
        const authValues = authConfig[authType];
        const injection = newInstance(authType);
        injection.apply(letter, authValues);
    }
}
export interface IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void;
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
