import { newInstance as iNewInstance } from "../../../../lib/di.ts";
import { Trace } from "../../../../lib/etc.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

const newInstance = {
  newInstance(): Object {
    return new BearerTokenAuthorizer();
  },
} as iNewInstance;
export { newInstance };

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
