import { Action, asAny, Trace } from "../../../../lib/etc.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../../../lib/module.ts";
import tim from "../../../../lib/tim.ts";
import { Model } from "../../../../storage/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { RequestsModule } from "../requests/mod.ts";

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
    if (
      (action.features.format) || action.features.execute
    ) {
      try {
        tim(model, asAny(model).Variables);
      } catch (error) {
        console.warn("Missing tag but we will let it slide for now", "(" + error.message + ")");
      }
    }
    return Promise.resolve();
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, fail, it } from "../../../../lib/tests.ts";

describe("TemplateModule", () => {
  describe("modify", () => {
    it("works", async () => {
      // fail("Write this test");
    });
  });
});
