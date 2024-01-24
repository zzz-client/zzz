import { Action, Meld, StringToStringMap } from "../../../../lib/lib.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model, ParentModel } from "../../../../storage/mod.ts";

export class RequestsModule extends Module implements IModuleFeatures, IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [];
  features: Feature[] = [
    {
      name: "execute",
      description: "Execute request",
      type: "boolean",
      alias: "x",
    },
  ];
  models: string[] = [HttpRequest.constructor.name, Collection.constructor.name];
  fields = {
    HttpRequest: HttpRequest,
  };
  modify(model: Model, action: Action): Promise<void> {
    return this.app.store.get(model.constructor.name, model.Id)
      .then((loadedModel) => {
        Meld(model, loadedModel);
        return Promise.resolve();
      });
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
