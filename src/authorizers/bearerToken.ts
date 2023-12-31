import { IAuthorization } from "../authorizer";
import Request from "../request";

export default class BearerTokenAuthorizer implements IAuthorization {
    apply(theRequest: Request, authorizationConfig: any): void {
        theRequest.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
    }
}
