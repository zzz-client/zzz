import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { Collection, HttpRequest, RequestsModule } from "../requests/mod.ts";

export class PathParamsModule extends Module implements IModuleFields, IModuleModifier {
  Name = "PathParams";
  dependencies = [RequestsModule.name];
  fields = {
    HttpRequest: {
      PathParams: "StringToStringMap",
    },
  };
  modify(entity: Model, _action: Action): Promise<void> {
    Trace("PathParamsModule:modify");
    if (entity instanceof HttpRequest && Module.hasFields(entity, Object.keys(this.fields.HttpRequest))) {
      helpers.loadPathParams(entity);
    }
    return Promise.resolve();
  }
}

const helpers = { loadPathParams };

function loadPathParams(theRequest: HttpRequest): void {
  const pathParams = asAny(theRequest).PathParams;
  if (pathParams) {
    for (const key of Object.keys(pathParams)) {
      const value = pathParams[key];
      theRequest.URL = theRequest.URL.replace(":" + key, value);
    }
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { assertEquals, assertSpyCall, assertSpyCalls, describe, it, stub, TestStore } from "../../../../lib/tests.ts";

describe("PathParamsModule", () => {
  describe("modify", () => {
    it("does nothing if the model is not HttpRequest", async () => {
      const loadStub = stub(helpers, "loadPathParams");
      const testStore = new TestStore();
      // GIVEN
      const model = new Collection();
      asAny(model).PathParams = {};
      // WHEN
      await new PathParamsModule(testStore).modify(model, new Action({}, {}));
      // THEN
      assertSpyCalls(loadStub, 0);
      loadStub.restore();
    });
    it("does nothing if the model does not have the PathParams attribute", async () => {
      const loadStub = stub(helpers, "loadPathParams");
      const testStore = new TestStore();
      // GIVEN
      const model = new HttpRequest();
      // WHEN
      await new PathParamsModule(testStore).modify(model, new Action({}, {}));
      // THEN
      assertSpyCalls(loadStub, 0);
      loadStub.restore();
    });
    it("loads params for an HttpRequest PathParams attribute", async () => {
      const loadStub = stub(helpers, "loadPathParams");
      const testStore = new TestStore();
      // GIVEN
      const model = new HttpRequest();
      asAny(model).PathParams = {};
      // WHEN
      await new PathParamsModule(testStore).modify(model, new Action({}, {}));
      // THEN
      assertSpyCalls(loadStub, 1);
      assertSpyCall(loadStub, 0, {
        args: [model],
      });
      loadStub.restore();
    });
    it("replaces the params in the URL", async () => {
      const testStore = new TestStore();
      // GIVEN
      const model = new HttpRequest();
      model.URL = "my/:param/path";
      asAny(model).PathParams = { param: "foobar" };
      // WHEN
      await new PathParamsModule(testStore).modify(model, new Action({}, {}));
      // THEN
      assertEquals(model.URL, "my/foobar/path");
    });
  });
});
describe("loadPathParams", () => {
  it("replaces the params in the URL", () => {
    // GIVEN
    const model = new HttpRequest();
    model.URL = "my/:first/path?foo=:second";
    asAny(model).PathParams = { first: "secret", second: "bar" };
    // WHEN
    loadPathParams(model);
    // THEN
    assertEquals(model.URL, "my/secret/path?foo=bar");
  });
});
