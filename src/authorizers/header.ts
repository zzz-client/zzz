import { IAuthorization } from "../authorizer.ts";
import Request from "../request.ts";

export default class HeaderAuthorizer implements IAuthorization {
  apply(theRequest: Request, authorizationConfig: Config): void {
    theRequest.Headers[authorizationConfig.Name] = authorizationConfig.Value;
  }
}
interface Config {
  Name: string;
  Value: string;
}
