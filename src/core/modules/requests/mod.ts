import { Action, Meld, StringToStringMap, Trace } from "../../etc.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../module.ts";
import { Model, ParentModel } from "../../storage/mod.ts";

export class RequestsModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  Name = "Requests";
  dependencies = [];
  features: Feature[] = [
    {
      name: "execute",
      description: "Execute request",
      type: "boolean",
      alias: "x",
    },
  ];
  models: string[] = [HttpRequest.name, Collection.name];
  fields = {
    HttpRequest: HttpRequest,
  };
  async modify(model: Model, _action: Action): Promise<void> {
    Trace("RequestsModule:modify", model.Id, model.Name);
    const modelType = await this.store.getModelType(model.Id);
    const loadedModel = await this.store.get(modelType, model.Id);
    Trace("RequestsModule:modify loaded Model", loadedModel);
    Meld(model, loadedModel);
    return await Promise.resolve();
  }
}
export class HttpRequest extends Model {
  URL!: string;
  Method!: HttpMethod;
  QueryParams!: StringToStringMap;
  Headers!: StringToStringMap;
}
export type CollectionChild = HttpRequest | Collection;
export class Collection extends Model implements ParentModel {
  Children: CollectionChild[] = [];
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

// ----------------------------------------- TESTS -----------------------------------------

import { assertSpyCall, assertSpyCalls, describe, it, resolvesNext, stub, TestStore } from "../../tests.ts";

describe("RequestsModule", () => {
  describe("modify", () => {
    it("works", async () => {
      const testStore = new TestStore();
      const testId = "42";
      // GIVEN
      const testModel = new HttpRequest();
      testModel.Id = testId;
      const getTypeStub = stub(testStore, "getModelType", resolvesNext(["HttpRequest"]));
      const getStub = stub(testStore, "get", resolvesNext([testModel]));
      // WHEN
      await new RequestsModule(testStore).modify(testModel, new Action({}, {}));
      // THEN
      assertSpyCalls(getTypeStub, 1);
      assertSpyCall(getTypeStub, 0, {
        args: [testId],
      });
      assertSpyCalls(getStub, 1);
      assertSpyCall(getStub, 0, {
        args: ["HttpRequest", testId],
      });
      getStub.restore();
      getTypeStub.restore();
    });
  });
});
