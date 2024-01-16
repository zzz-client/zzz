import { IAuthorizer } from "../../core/app.ts";
import { Entity } from "../../core/models.ts";

export default class HeaderAuthorizer implements IAuthorizer {
  authorize(theRequest: Entity, authorizationConfig: Config): void {
    theRequest.Headers[authorizationConfig.Name] = authorizationConfig.Value;
  }
}
interface Config {
  Name: string;
  Value: string;
}
