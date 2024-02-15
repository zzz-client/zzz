import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

export default class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Query): void {
    theRequest.QueryParams[data.Name] = data.Value;
  }
}
export type Query = AuthContents & {
  Name: string;
  Value: string;
};

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals, describe, it } from "../../../../lib/tests.ts";

describe("Query Authorizer", () => {
  it("sets header correctly", () => {
    const authorizer = new QueryAuthorizer();
    // GIVEN
    const request = new HttpRequest();
    request.QueryParams = {};
    const data: Query = {
      Name: "name",
      Value: "value",
    };
    // WHEN
    authorizer.authorize(request, data);
    // THEN
    assertEquals(request.QueryParams.name, "value", "QueryParams not set correctly");
  });
});
