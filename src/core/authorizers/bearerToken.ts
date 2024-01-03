import { IAuthorization } from "../factories.ts";
import ZzzRequest from "../models.ts";

export default class BearerTokenAuthorizer implements IAuthorization {
  apply(theRequest: ZzzRequest, authorizationConfig: any): void {
    theRequest.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
  }
}
