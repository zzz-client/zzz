import { exit } from "process";
import Letter from "./letter";
import { Get, EntityType } from "./store";

export default function Authorize(letter: Letter, authorizationDefinition: string): void {
    console.log("Authorizing", authorizationDefinition);
    exit(1);
    const authConfig = Get(EntityType.Authorization, authorizationDefinition);
    const authType = extractAuthType(authConfig);
    const authValues = authConfig[authType];
    const injection = newInstance(authType);
    injection.apply(letter, authValues);
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
interface IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void;
}
class BearerTokenAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
    }
}
class BasicAuthAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.Headers["Authorization"] = "Basic " + Buffer.from(authorizationConfig.Username + authorizationConfig.Password).toString("base64");
    }
}
class HeaderAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.Headers[authorizationConfig.Name] = authorizationConfig.Value;
    }
}
class QueryAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.QueryParams[authorizationConfig.Param] = authorizationConfig.Value;
    }
}
