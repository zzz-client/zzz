import { encode64 } from "https://deno.land/x/base64to@v0.0.2/mod.ts";
import { IAuthorizer } from "../../core/app.ts";
import { HttpRequest } from "../requests/module.ts";

export class BasicAuthAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: BasicAuth): void {
    theRequest.Headers["Authorization"] = "Basic " + encode64(data.Username + data.Password);
  }
}
export type BasicAuth = {
  Username: string;
  Password: string;
};
