import { IAuthorizer } from "../../core/app.ts";
import ZzzRequest from "../../core/models.ts";

export default class BearerTokenAuthorizer implements IAuthorizer {
  authorize(theRequest: ZzzRequest, authorizationConfig: string): void {
    theRequest.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
  }
}
