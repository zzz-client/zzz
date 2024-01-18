import { HttpRequest } from "../requests/module.ts";
import { AuthType, IAuthorizer } from "./module.ts";

export class BearerTokenAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, token: BearerToken): void {
    theRequest.Headers["Authorization"] = `Bearer ${token}`;
  }
}

export type BearerToken = AuthType & string;
