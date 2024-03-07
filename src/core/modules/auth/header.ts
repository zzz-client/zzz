import { Trace } from "../../etc.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

export default class HeaderAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Header): void {
    Trace("Header:", data);
    theRequest.Headers[data.Name] = data.Value;
  }
}
export type Header = AuthContents & {
  Name: string;
  Value: string;
};

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals, describe, it } from "../../tests.ts";

describe("Header Authorizer", () => {
  it("sets header correctly", () => {
    const authorizer = new HeaderAuthorizer();
    // GIVEN
    const request = new HttpRequest();
    request.Headers = {};
    const data: Header = {
      Name: "name",
      Value: "value",
    };
    // WHEN
    authorizer.authorize(request, data);
    // THEN
    assertEquals(request.Headers.name, "value", "Header not set correctly");
  });
});
