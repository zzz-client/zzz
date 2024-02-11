import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class PathParamsModule extends Module implements IModuleFields, IModuleModifier {
  Name = "PathParams";
  dependencies = [RequestsModule.name];
  fields = {
    HttpRequest: {
      PathParams: "StringToStringMap",
    },
  };
  async modify(entity: Model, _action: Action): Promise<void> {
    Trace("PathParamsModule:modify");
    if (entity instanceof HttpRequest && Module.hasFields(entity, Object.keys(this.fields))) {
      await this.loadPathParams(entity as HttpRequest);
    }
    return Promise.resolve();
  }
  private loadPathParams(theRequest: HttpRequest): Promise<void> {
    const pathParams = asAny(theRequest).PathParams;
    if (pathParams) {
      for (const key of Object.keys(pathParams)) {
        const value = pathParams[key];
        theRequest.URL = theRequest.URL.replace(":" + key, value);
      }
    }
    return Promise.resolve();
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "https://deno.land/std/testing/bdd.ts";
import { fail } from "https://deno.land/std/assert/fail.ts";

describe("PathParamsModule", () => {
  describe("modify", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
  describe("loadPathParams", () => {
    it("works", async () => {
      fail("Write this test");
    });
  });
});
