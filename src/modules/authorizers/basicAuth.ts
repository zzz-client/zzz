import { encode64 } from "https://deno.land/x/base64to@v0.0.2/mod.ts";
import ZzzRequest from "../../core/models.ts";
import { IAuthorizer } from "../../core/app.ts";

export default class BasicAuthAuthorizer implements IAuthorizer {
  authorize(theRequest: ZzzRequest, authorizationConfig: Config): void {
    theRequest.Headers["Authorization"] = "Basic " + encode64(authorizationConfig.Username + authorizationConfig.Password);
  }
}
interface Config {
  Username: string;
  Password: string;
}
