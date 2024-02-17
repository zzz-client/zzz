import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";

export class RedactModule extends Module implements IModuleModifier, IModuleFeatures {
  Name = "Redact";
  dependencies = [];
  features = [{
    hidden: true,
    name: "redact",
    description: "Redact fields from being included in the response",
    type: "string[]",
  } as Feature];
  modify(entity: Model, action: Action): Promise<void> {
    Trace("RedactModule:modify");
    if (!action.features.all && !action.features.execute) {
      helpers.redactVariables(entity);
    }
    if (!action.features.execute) {
      helpers.redactExecuteOnly(entity);
    }
    return Promise.resolve();
  }
}

function redactVariables(entity: Model): void {
  if ("Variables" in entity) {
    delete asAny(entity).Variables;
  }
}
function redactExecuteOnly(entity: Model): void {
  if ("Cookies" in entity) {
    delete entity.Cookies;
  }
}

const helpers = {
  redactVariables,
  redactExecuteOnly,
};

// ----------------------------------------- TESTS -----------------------------------------

import { assert, describe, it, TestStore } from "../../../../lib/tests.ts";
import { HttpRequest } from "../requests/mod.ts";

describe("RedactModule", () => {
  describe("modify", () => {
    it("redacts Variables when the all and execute features are not enabled", async () => {
      const testStore = new TestStore();
      const httpRequest = new HttpRequest();
      // GIVEN
      asAny(httpRequest).Variables = {};
      const action = new Action({ all: false, execute: false }, {});
      // WHEN
      await new RedactModule(testStore).modify(httpRequest, action);
      // THEN
      assert(!("Variables" in httpRequest), "Variables was not redacted");
    });
    it("does not redact Variables if the all feature is enabled", async () => {
      const testStore = new TestStore();
      const httpRequest = new HttpRequest();
      // GIVEN
      asAny(httpRequest).Variables = {};
      const action = new Action({ all: true, execute: false }, {});
      // WHEN
      await new RedactModule(testStore).modify(httpRequest, action);
      // THEN
      assert("Variables" in httpRequest, "Variables was redacted");
    });
    it("does not redact Cookies if the execute feature is enabled", async () => {
      const testStore = new TestStore();
      const httpRequest = new HttpRequest();
      // GIVEN
      asAny(httpRequest).Cookies = {};
      const action = new Action({ execute: true }, {});
      // WHEN
      await new RedactModule(testStore).modify(httpRequest, action);
      // THEN
      assert("Cookies" in httpRequest, "Cookies was redacted");
    });
  });
});

describe("redactVariables", () => {
  it("deletes the Variables property if it exists", () => {
    // GIVEN
    const httpRequest = new HttpRequest();
    asAny(httpRequest).Variables = {};
    // WHEN
    helpers.redactVariables(httpRequest);
    // THEN
    assert(!("Variables" in httpRequest), "Variables was not redacted");
  });
  it("does nothing if the Variables property does not exists", () => {
    // GIVEN
    const httpRequest = new HttpRequest();
    // WHEN
    helpers.redactVariables(httpRequest);
    // THEN
    assert(!("Variables" in httpRequest), "Variables was somehow unredacted");
  });
});
describe("redactExecuteOnly", () => {
  it("deletes the Cookies property if it exists", () => {
    // GIVEN
    const httpRequest = new HttpRequest();
    asAny(httpRequest).Cookies = {};
    // WHEN
    helpers.redactExecuteOnly(httpRequest);
    // THEN
    assert(!("Cookies" in httpRequest), "Cookies was not redacted");
  });
  it("does nothing if the Cookies property does not exists", () => {
    // GIVEN
    const httpRequest = new HttpRequest();
    // WHEN
    helpers.redactExecuteOnly(httpRequest);
    // THEN
    assert(!("Cookies" in httpRequest), "Cookies was somehow unredacted");
  });
});
