import { newInstance as iNewInstance } from "../../../../lib/di.ts";
import { Trace } from "../../../../lib/etc.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

const newInstance = {
  newInstance(): object {
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

// ----------------------------------------- TESTS -----------------------------------------
import { describe, it } from "https://deno.land/std/testing/bdd.ts";
import { assertEquals } from "../../../../lib/tests.ts";

describe("newInstance", () => {
  it("constructs a BearerTokenAuthorizer", () => {
    const authorizer = newInstance.newInstance();
    assertEquals(authorizer instanceof BearerTokenAuthorizer, true, "authorizer not created");
  });
});

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
