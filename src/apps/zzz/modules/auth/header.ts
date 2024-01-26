import { newInstance as iNewInstance } from "../../../../lib/di.ts";
import { Trace } from "../../../../lib/lib.ts";
import { HttpRequest } from "../requests/mod.ts";
import { AuthContents, IAuthorizer } from "./mod.ts";

const newInstance = {
  newInstance(): Object {
    return new HeaderAuthorizer();
  },
} as iNewInstance;
export { newInstance };

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

import { assertEquals } from "../../../../lib/tests.ts";
Deno.test("Header Authorizer", () => {
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
