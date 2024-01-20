import { Model } from "../../core/yeet.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../core/module.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import TemplateModule from "../template/mod.ts";
import Action from "../../core/action.ts";

// TODO: All of ContextModule
export class ContextModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  dependencies: (typeof Module)[] = [RequestsModule, TemplateModule];
  features: Feature[] = [
    {
      name: "all",
      alias: "a",
      description: "Display resolved data for the current context",
      type: "boolean",
    },
    {
      name: "context",
      alias: "c",
      description: "Manually supplied context",
      type: "string",
      argument: "context",
    },
  ];
  models = [Context];
  fields = {
    Request: {
      variables: "StringToStringMap",
    },
    Collection: {
      variables: "StringToStringMap",
    },
    Scope: {
      variables: "StringToStringMap",
    },
    Context: {
      variables: "StringToStringMap",
    },
  };
  async modify(theModel: Model, action: Action): Promise<void> {
    // TODO:
    if (this.app.feature.full || this.app.feature.format || this.app.feature.execute) {
      return Load(theModel as HttpRequest, context, await this.app.getStore()); // TODO: What do with context
    }
    return Promise.resolve();
  }
}

export class Context extends Model {}
