import { Action, asAny, Trace } from "../../../../lib/lib.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { ContextModule } from "../context/mod.ts";
import { RequestsModule } from "../requests/mod.ts";
import tim from "../../../../lib/tim.ts";

export default class TemplateModule extends Module implements IModuleFeatures, IModuleModifier {
  dependencies = [RequestsModule.constructor.name, ContextModule.constructor.name];
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
      action.features.format &&
      ContextModule.hasFields(model)
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
