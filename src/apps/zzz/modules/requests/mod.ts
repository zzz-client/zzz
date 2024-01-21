import { Meld, StringToStringMap } from "../../../../lib/lib.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module, ModuleField } from "../../../../lib/module.ts";
import { Action } from "../../../../lib/lib.ts";
import { Model, ParentModel } from "../../../../stores/files/store.ts";

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
  models: (typeof Model)[] = [HttpRequest, Collection];
  fields = {
    HttpRequest: {
      url: "string",
      // method: HttpMethod, // TODO: why undefined
      // headers: StringToStringMap, // TODO: why undefined
      description: "Params to be replaced in the URL",
    } as ModuleField,
  };
  async modify(model: Model, action: Action): Promise<void> {
    console.log("requests module", model, action);
    const loadedModel = await this.app.store.get(HttpRequest, model.Id);
    Meld(model, loadedModel);
    return Promise.resolve();
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
