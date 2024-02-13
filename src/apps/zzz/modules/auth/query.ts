import { newInstance as iNewInstance } from "../../../../lib/di.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

const newInstance = {
  newInstance(): object {
    return new QueryAuthorizer();
  },
} as iNewInstance;
export { newInstance };

export class QueryAuthorizer implements IAuthorizer {
  authorize(theRequest: HttpRequest, data: Query): void {
    theRequest.QueryParams[data.Name] = data.Value;
  }
}
export type Query = AuthContents & {
  Name: string;
  Value: string;
};

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { describe, it } from "https://deno.land/std/testing/bdd.ts";

describe("newInstance", () => {
  it("constructs a QueryAuthorizer", () => {
    const authorizer = newInstance.newInstance();
    assertEquals(authorizer instanceof QueryAuthorizer, true, "authorizer not created");
  });
});

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
