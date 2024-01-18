import { Model } from "../../core/yeet.ts";
import { Flag, IModuleFields, IModuleFlags, IModuleModels, IModuleModifier, Module } from "../module.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";
import TemplateModule from "../template/module.ts";

// TODO: All of ContextModule
export class ContextModule extends Module implements IModuleFlags, IModuleModels, IModuleFields, IModuleModifier {
  dependencies: (typeof Module)[] = [RequestsModule, TemplateModule];
  flags: Flag[] = [
    {
      name: "full",
      description: "Display resolved data for the current context",
      type: "boolean",
    },
    {
      name: "context",
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
  modify(theModel: Model): Promise<void> {
    // TODO:
    if (this.app.feature.full || this.app.feature.format || this.app.feature.execute) {
      return Load(theModel as HttpRequest, context, await this.app.getStore()); // TODO: What do with context
    }
    return Promise.resolve();
  }
}

export class Context extends Model {}
