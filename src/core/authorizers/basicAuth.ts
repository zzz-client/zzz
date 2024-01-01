import { IAuthorization } from "../authorizer.ts";
import { base64 } from "../libs.ts";
import Request from "../request.ts";

export default class BasicAuthAuthorizer implements IAuthorization {
  apply(theRequest: Request, authorizationConfig: Config): void {
    theRequest.Headers["Authorization"] = "Basic " + base64(authorizationConfig.Username + authorizationConfig.Password);
  }
}
interface Config {
  Username: string;
  Password: string;
}
