import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import TemplateModule from "../template/mod.ts";
import { Action, StringToStringMap } from "../../../../lib/lib.ts";
import { Model } from "../../../../storage/mod.ts";

// TODO: All of ContextModule
export class ContextModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  dependencies: string[] = [RequestsModule.constructor.name, TemplateModule.constructor.name];
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
  models = [Context]; // TODO: What
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
    if (this.app.feature.all || this.app.feature.format || this.app.feature.execute) {
      return Load(theModel as HttpRequest, context, await this.app.getStore()); // TODO: What do with context
    }
    return Promise.resolve();
  }
}

export class Context extends Model {
  Variables: StringToStringMap = {};
}
