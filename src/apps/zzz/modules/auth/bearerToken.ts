import { Trace } from "../../../../lib/etc.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

export default class BearerTokenAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, token: BearerToken): void {
    Trace("BearerToken:", token);
    theRequest.Headers["Authorization"] = `Bearer ${token}`;
  }
}

export type BearerToken = AuthContents & string;

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals, describe, it } from "../../../../lib/tests.ts";

describe("Bearer Token Authorizer", () => {
  it("sets header correctly", () => {
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
});
