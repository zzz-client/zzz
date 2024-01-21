import { encode64 } from "https://deno.land/x/base64to@v0.0.2/mod.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthType, IAuthorizer } from "./mod.ts";

export class BasicAuthAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: BasicAuth): void {
    theRequest.Headers["Authentication"] = "Basic " + encode64(data.Username + data.Password);
  }
}
export type BasicAuth = AuthType & {
  Username: string;
  Password: string;
};
