import { IAuthorization } from "../factories.ts";
import Request from "../request.ts";

export default class BearerTokenAuthorizer implements IAuthorization {
  apply(theRequest: Request, authorizationConfig: any): void {
    theRequest.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
  }
}
