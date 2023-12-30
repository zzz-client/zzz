import Letter from "./letter";

export default function Authorize(letter: Letter, authorizationDefinition: string): void {
    // Load from `authorizations/$authorizationDefinition` and load its config to an `any`....somehow
    const authConfig = loadAuthConfig(authorizationDefinition);
    // Determine which type it is by what its root key is
    const authType = extractAuthType(authConfig);
    // Inject the correct implementation
    const injection = newInstance(authType);
    // Apply the changes onto the request
    const authValues = authConfig[authType];
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
function loadAuthConfig(authorizationDefinition: string): any {
    // TODO
    throw new Error("Load from `authorizations/$authorizationDefinition` and load its config to an `any`....somehow");
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
        letter.headers["Authorization"] = `Bearer ${authorizationConfig}`;
    }
}
class BasicAuthAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.headers["Authorization"] = `Basic base64 of authorizationConfig.Username + authorizationConfig.Password`;
    }
}
class HeaderAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.headers[authorizationConfig.Name] = authorizationConfig.Value;
    }
}
class QueryAuthorizer implements IAuthorization {
    apply(letter: Letter, authorizationConfig: any): void {
        letter.queryParams[authorizationConfig.Param] = authorizationConfig.Value;
    }
}
