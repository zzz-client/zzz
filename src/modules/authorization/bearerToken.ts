import { IAuthorizer } from "../../core/app.ts";
import { HttpRequest } from "../requests/module.ts";

export class BearerTokenAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, token: BearerToken): void {
    theRequest.Headers["Authorization"] = `Bearer ${token}`;
  }
}

export type BearerToken = string;
