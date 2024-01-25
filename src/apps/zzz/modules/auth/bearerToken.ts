import { Trace } from "../../../../lib/lib.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

export class BearerTokenAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, token: BearerToken): void {
    Trace("BearerToken:", token);
    theRequest.Headers["Authorization"] = `Bearer ${token}`;
  }
}

export type BearerToken = AuthContents & string;

import { assertEquals } from "../../../../lib/tests.ts";
Deno.test("Bearer Token Authorizer", () => {
  const authorizer = new BearerTokenAuthorizer();
  // GIVEN
  const request = new HttpRequest();
  request.Headers = {};
  const data: BearerToken = "bearerToken";
  // WHEN
  authorizer.authorize(request, data);
  // THEN
  assertEquals(request.Headers.Authorization, "Bearer bearerToken", "Authorization header not set correctly");
});
