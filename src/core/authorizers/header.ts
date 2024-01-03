import { IAuthorization } from "../factories.ts";
import ZzzRequest from "../models.ts";

export default class HeaderAuthorizer implements IAuthorization {
  apply(theRequest: ZzzRequest, authorizationConfig: Config): void {
    theRequest.Headers[authorizationConfig.Name] = authorizationConfig.Value;
  }
}
interface Config {
  Name: string;
  Value: string;
}
