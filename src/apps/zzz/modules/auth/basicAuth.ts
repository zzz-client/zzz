import { encode64 } from "../../../../lib/deps.ts";
import { newInstance as iNewInstance } from "../../../../lib/di.ts";
import { Trace } from "../../../../lib/etc.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

const newInstance = {
  newInstance(): object {
    return new BasicAuthAuthorizer();
  },
} as iNewInstance;
export { newInstance };

export default class BasicAuthAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: BasicAuth): void {
    Trace("BasicAuthAuthorizer:", data);
    theRequest.Headers["Authorization"] = "Basic " + encode64(data.Username + data.Password);
  }
}
export type BasicAuth = AuthContents & {
  Username: string;
  Password: string;
};

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals, describe, it } from "../../../../lib/tests.ts";

describe("newInstance", () => {
  it("constructs a BasicAuthAuthorizer", () => {
    const authorizer = newInstance.newInstance();
    assertEquals(authorizer instanceof BasicAuthAuthorizer, true, "authorizer not created");
  });
});

describe("Basic Auth Authorizer", () => {
  it("sets header correctly", () => {
    const authorizer = new BasicAuthAuthorizer();
    // GIVEN
    const request = new HttpRequest();
    request.Headers = {};
    const data: BasicAuth = {
      Username: "user",
      Password: "pass",
    };
    // WHEN
    authorizer.authorize(request, data);
    // THEN
    assertEquals(request.Headers.Authorization, "Basic dXNlcnBhc3M=", "Authorization header not set correctly");
  });
});
