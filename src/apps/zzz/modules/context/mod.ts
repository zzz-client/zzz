import { Action, StringToStringMap } from "../../../../lib/lib.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { RequestsModule } from "../requests/mod.ts";
import TemplateModule from "../template/mod.ts";
import Loader, { Apply, GLOBALS_CONTEXT, ILoader, SESSION_CONTEXT } from "./loader.ts";

export class ContextModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  dependencies: string[] = [RequestsModule.constructor.name, TemplateModule.constructor.name];
  features: Feature[] = [
    {
      name: "all",
      // alias: "a", // TODO: Uncomment for compiling because otherwise `deno run -A` will always be included in this
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
  modify(subjectModel: Model, action: Action): Promise<void> {
    const context = action.features.context as string;
    if (action.features.all || action.features.format || action.features.execute) {
      return this.load(subjectModel.Id, context).then(async (loadedModels) => {
        for (const loadedModel in loadedModels) {
          await this.loader.defaults(subjectModel.Id, this.app.store).then((defaults) => {
            Apply(loadedModel, defaults);
          });
        }
      });
    }
    return Promise.resolve();
  }
  private loader = new Loader() as ILoader;

  private load(modelId: string, contextName: string): Promise<Model[]> {
    return Promise.all([
      this.loader.globals(this.app.store),
      this.loader.local(GLOBALS_CONTEXT, this.app.store),
      this.loader.context(contextName, this.app.store),
      this.loader.local(contextName, this.app.store),
      this.loader.defaults(modelId, this.app.store), // TODO: is this right or does it need to be the model's parent's id?
      this.loader.local(SESSION_CONTEXT, this.app.store),
    ]);
  }
}

export class Context extends Model {
  Variables: StringToStringMap = {};
}
