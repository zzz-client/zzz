import { IAuthorization } from "../authorizer";
import Request from "../request";

export default class QueryAuthorizer implements IAuthorization {
    apply(theRequest: Request, authorizationConfig: Config): void {
        theRequest.QueryParams[authorizationConfig.Param] = authorizationConfig.Value;
    }
}
interface Config {
    Param: string;
    Value: string;
}
