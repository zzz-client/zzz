import { Model } from "../../core/yeet.ts";
import { ContextModule } from "../context/module.ts";
import { Feature, IModuleFeatures, IModuleModifier, Module } from "../../core/module.ts";
import { RequestsModule } from "../requests/module.ts";
import tim from "./tim.ts";

export default class TemplateModule extends Module implements IModuleFeatures, IModuleModifier {
  dependencies = [RequestsModule, ContextModule];
  flags: Feature[] = [
    {
      name: "execute",
      description: "Execute request",
      type: "boolean",
      argument: "request",
      alias: "x",
    },
  ];
  modify(model: Model): Promise<void> {
    if (ContextModule.hasFields(model)) {
      tim(model, (model as any).Variables);
    }
    return Promise.resolve();
  }
}
