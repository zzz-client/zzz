import { IAuthorizer } from "../../core/app.ts";
import { Entity } from "../../core/models.ts";

export default class BearerTokenAuthorizer implements IAuthorizer {
  authorize(theRequest: Entity, authorizationConfig: string): void {
    theRequest.Headers["Authorization"] = `Bearer ${authorizationConfig}`;
  }
}
