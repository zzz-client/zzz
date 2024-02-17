// deno-lint-ignore-file no-explicit-any
import { axios } from "../../../lib/deps.ts";
import { asAny } from "../../../lib/etc.ts";
import { Model } from "../../../storage/mod.ts";
import { HttpRequest } from "../modules/requests/mod.ts";

// TODO: Move to own file?
export interface IActor {
  act(theRequest: Model): Promise<any>;
}

export default class ExecuteActor implements IActor {
  async act(theModel: Model): Promise<any> {
    try {
      return await helpers.doRequest(theModel as HttpRequest); // TODO: Naughty cast
    } catch (error) {
      throw helpers.formatError(error);
    }
  }
}
const helpers = { formatError, doRequest };
function formatError(error: any) {
  if (error.response && error.response.data) {
    return error.response.data;
  }
  if (error.code) {
    return new Error(error.code);
  }
  return error;
}
async function doRequest(theRequest: HttpRequest): Promise<any> {
  return (
    await axios({
      method: theRequest.Method,
      headers: theRequest.Headers,
      params: theRequest.QueryParams,
      url: theRequest.URL,
      data: asAny(theRequest).Body,
    })
  ).data;
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "../../../lib/tests.ts";

describe("ExecuteActor", () => {
  describe("act", () => {
    it("calls doRequest", async () => {
      // fail("Write this test");
    });
    it("calls formatError on error", async () => {
      // fail("Write this test");
    });
    it("sets header correctly", async () => {
      // fail("Write this test");
    });
  });
});
describe("formatError", () => {
  it("returns response data if present", async () => {
    // fail("Write this test");
  });
  it("returns code if present and response data is missing", async () => {
    // fail("Write this test");
  });
  it("returns input if response data and code are not present", async () => {
    // fail("Write this test");
  });
});
describe("doRequest", () => {
  it("calls axios", async () => {
    // fail("Write this test");
  });
});
