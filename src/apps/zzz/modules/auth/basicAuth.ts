import { encode64 } from "https://deno.land/x/base64to@v0.0.2/mod.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";
import { Trace } from "../../../../lib/lib.ts";

export class BasicAuthAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: BasicAuth): void {
    Trace("BasicAuthAuthorizer:", data);
    theRequest.Headers["Authorization"] = "Basic " + encode64(data.Username + data.Password);
  }
}
export type BasicAuth = AuthContents & {
  Username: string;
  Password: string;
};
