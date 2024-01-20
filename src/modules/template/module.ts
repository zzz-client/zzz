import { Model } from "../../core/yeet.ts";
import { ContextModule } from "../context/module.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../core/module.ts";
import { RequestsModule } from "../requests/module.ts";
import tim from "./tim.ts";
import Action from "../../core/action.ts";

export default class TemplateModule extends Module implements IModuleFeatures, IModuleModifier {
  dependencies = [RequestsModule, ContextModule];
  features: Feature[] = [
    {
      name: "format",
      alias: "f",
      description: "Apply variables",
      type: "boolean",
    },
  ];
  modify(model: Model, action: Action): Promise<void> {
    if (
      action.feature.format &&
      ContextModule.hasFields(model)
    ) {
      tim(model, (model as any).Variables);
    }
    return Promise.resolve();
  }
}
