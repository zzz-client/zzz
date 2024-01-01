import { encode64 } from "https://deno.land/x/base64to@v0.0.2/mod.ts";
import { IAuthorization } from "../factories.ts";
import ZzzRequest from "../request.ts";

export default class BasicAuthAuthorizer implements IAuthorization {
  apply(theRequest: ZzzRequest, authorizationConfig: Config): void {
    theRequest.Headers["Authorization"] = "Basic " + encode64(authorizationConfig.Username + authorizationConfig.Password);
  }
}
interface Config {
  Username: string;
  Password: string;
}
