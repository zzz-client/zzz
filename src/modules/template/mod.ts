import { Model } from "../../apps/core/yeet.ts";
import { ContextModule } from "../context/mod.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../module.ts";
import { RequestsModule } from "../requests/mod.ts";
import tim from "./tim.ts";
import Action from "../../apps/core/action.ts";

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
