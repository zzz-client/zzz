import { Action, StringToStringMap, Trace } from "../../etc.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../module.ts";
import { Model } from "../../storage/mod.ts";
import { RequestsModule } from "../requests/mod.ts";
import TemplateModule from "../template/mod.ts";
import Loader, { Apply, GLOBALS_CONTEXT, ILoader, SESSION_CONTEXT } from "./loader.ts";

export class ContextModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  Name = "Context";
  dependencies: string[] = [RequestsModule.name, TemplateModule.name];
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
  models = [Context.name];
  fields = {
    Request: {
      Variables: "StringToStringMap",
    },
    Collection: {
      Variables: "StringToStringMap",
    },
    Scope: {
      Variables: "StringToStringMap",
    },
    Context: {
      Variables: "StringToStringMap",
    },
  };
  async modify(subjectModel: Model, action: Action): Promise<void> {
    Trace("ContextModule:modify");
    const context = this.getContext(action);
    if (action.features.all || action.features.format || action.features.execute) {
      const loadedDefaults = await this.load(subjectModel.Id, context);
      for (const defaults of loadedDefaults) {
        await Apply(subjectModel, defaults);
      }
    }
    return Promise.resolve();
  }
  private getContext(action: Action): string {
    return (action.features.context || action.env["ZZZ_CONTEXT"]) as string;
  }
  private loader = new Loader(this.store) as ILoader;
  private load(modelId: string, contextName: string): Promise<Model[]> {
    return Promise.all([
      this.loader.globals(),
      this.loader.local(GLOBALS_CONTEXT),
      this.loader.context(contextName),
      this.loader.local(contextName),
      this.loader.defaults(modelId), // TODO: is this right or does it need to be the model's parent's id?
      this.loader.local(SESSION_CONTEXT),
    ]);
  }
}

export class Context extends Model {
  Variables: StringToStringMap = {};
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, it } from "../../tests.ts";

describe("ContextModule", () => {
  describe("modify", () => {
    it("???", async () => {
      // fail("Write this test");
    });
  });
  describe("getContext", () => {
    it("???", async () => {
      // fail("Write this test");
    });
  });
  describe("load", () => {
    it("???", async () => {
      // fail("Write this test");
    });
  });
});
