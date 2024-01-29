import { Action, Meld, StringToStringMap, Trace } from "../../../../lib/etc.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model, ParentModel } from "../../../../storage/mod.ts";

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
    const modelType = model.Name; // TODO: THis is not set yet! How can we determine it???
    const loadedModel = await this.app.store.get(modelType, model.Id);
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
