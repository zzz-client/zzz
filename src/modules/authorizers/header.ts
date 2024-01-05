import { IAuthorizer } from "../../core/app.ts";
import ZzzRequest from "../../core/models.ts";

export default class HeaderAuthorizer implements IAuthorizer {
  authorize(theRequest: ZzzRequest, authorizationConfig: Config): void {
    theRequest.Headers[authorizationConfig.Name] = authorizationConfig.Value;
  }
}
interface Config {
  Name: string;
  Value: string;
}
