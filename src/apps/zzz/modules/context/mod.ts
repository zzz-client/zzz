import { Action, Meld, StringToStringMap } from "../../../../lib/lib.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model, ParentModel } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import TemplateModule from "../template/mod.ts";
import { GLOBALS_CONTEXT, ILoader, Loader, SESSION_CONTEXT } from "./loader.ts";

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
  models = [Context.constructor.name];
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
  modify(theModel: Model, action: Action): Promise<void> {
    // TODO:
    const context = action.feature.context as string;
    if (this.app.feature.all || this.app.feature.format || this.app.feature.execute) {
      return this.load(theModel.Id, context).then((models) => {
        for (const model in models) {
          Meld(theModel, model);
        }
      });
    }
    return Promise.resolve();
  }

  private load(modelId: string, contextName: string): Promise<Model[]> {
    const loader = new Loader() as ILoader;
    return Promise.all([
      loader.globals(this.app.store),
      loader.local(GLOBALS_CONTEXT, this.app.store),
      loader.context(contextName, this.app.store),
      loader.local(contextName, this.app.store),
      loader.defaults(modelId, this.app.store), // TODO: is this right or does it need to be the model's parent's id?
      loader.local(SESSION_CONTEXT, this.app.store),
    ]);
  }
}

export class Context extends Model {
  Variables: StringToStringMap = {};
}
