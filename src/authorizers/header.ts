import { IAuthorization } from "../authorizer";
import Request from "../request";

export default class HeaderAuthorizer implements IAuthorization {
    apply(theRequest: Request, authorizationConfig: Config): void {
        theRequest.Headers[authorizationConfig.Name] = authorizationConfig.Value;
    }
}
interface Config {
    Name: string;
    Value: string;
}
