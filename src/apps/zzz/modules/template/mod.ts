import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../../../lib/module.ts";
import tim from "../../../../lib/tim.ts";
import { Model } from "../../../../storage/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export default class TemplateModule extends Module implements IModuleFeatures, IModuleModifier {
  Name = "Template";
  dependencies = [RequestsModule.name, ContextModule.name];
  features: Feature[] = [
    {
      name: "format",
      alias: "f",
      description: "Apply variables",
      type: "boolean",
    },
  ];
  modify(model: Model, action: Action): Promise<void> {
    Trace("TemplateModule:modify");
    if (action.features.format || action.features.execute) {
      helpers.templateize(model, asAny(model).Variables);
    }
    return Promise.resolve();
  }
}

const helpers = {
  // deno-lint-ignore no-explicit-any
  templateize(model: Model, variables: any): void {
    try {
      tim(model, variables);
    } catch (error) {
      console.warn("Missing tag but we will let it slide for now", "(" + error.message + ")");
    }
  },
};

// ----------------------------------------- TESTS -----------------------------------------

import { assertSpyCall, assertSpyCalls, describe, it, spy, TestStore } from "../../../../lib/tests.ts";

describe("TemplateModule", () => {
  describe("modify", () => {
    it("works when format feature is enabled", () => {
      const testStore = new TestStore();
      const module = new TemplateModule(testStore);
      const templateizeSpy = spy(helpers, "templateize");
      const testRequest = new HttpRequest();
      const testVariables = { foo: "bar" };
      asAny(testRequest).Variables = testVariables;
      // GIVEN
      const action = new Action({ format: true }, {});
      // WHEN
      module.modify(testRequest, action);
      // THEN
      assertSpyCall(templateizeSpy, 0, {
        args: [testRequest, testVariables],
      });
      templateizeSpy.restore();
    });
    it("works when format execute is enabled", () => {
      const testStore = new TestStore();
      const module = new TemplateModule(testStore);
      const templateizeSpy = spy(helpers, "templateize");
      const testRequest = new HttpRequest();
      const testVariables = { foo: "bar" };
      asAny(testRequest).Variables = testVariables;
      // GIVEN
      const action = new Action({ execute: true }, {});
      // WHEN
      module.modify(testRequest, action);
      // THEN
      assertSpyCall(templateizeSpy, 0, {
        args: [testRequest, testVariables],
      });
      templateizeSpy.restore();
    });
    it("does not work when no applicable features are enabled", () => {
      const testStore = new TestStore();
      const module = new TemplateModule(testStore);
      const templateizeSpy = spy(helpers, "templateize");
      const testRequest = new HttpRequest();
      const testVariables = { foo: "bar" };
      asAny(testRequest).Variables = testVariables;
      // GIVEN
      const action = new Action({}, {});
      // WHEN
      module.modify(testRequest, action);
      // THEN
      assertSpyCalls(templateizeSpy, 0);
      templateizeSpy.restore();
    });
  });
});
