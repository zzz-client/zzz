import { Model } from "../../core/yeet.ts";
import { ContextModule } from "../context/module.ts";
import { Flag, IModuleFlags, IModuleModifier, Module } from "../module.ts";
import { RequestsModule } from "../requests/module.ts";
import tim from "./tim.ts";

export default class TemplateModule extends Module implements IModuleFlags, IModuleModifier {
  dependencies = [RequestsModule, ContextModule];
  flags: Flag[] = [
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
