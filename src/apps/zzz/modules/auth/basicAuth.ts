import { encode64 } from "../../../../lib/deps.ts";
import { Trace } from "../../../../lib/etc.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

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
