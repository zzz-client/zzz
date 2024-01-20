import { Model, StringToStringMap } from "../../lib/lib.ts";
import { Feature, IModuleFeatures, IModuleFields, IModuleModels, IModuleModifier, Module, ModuleField } from "../../module.ts";
import Action from "../../apps/core/action.ts";

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
  models: (typeof Model)[] = [HttpRequest, Collection]; // TODO: Why is this constructor a problem
  fields = {
    HttpRequest: {
      url: "string",
      // method: HttpMethod, // TODO: why undefined
      // headers: StringToStringMap, // TODO: why undefined
      description: "Params to be replaced in the URL",
    } as ModuleField,
  };
  modify(model: Model, action: Action): Promise<void> {
    console.log("requests module");
    // TODO: Get from Store?
    return Promise.resolve();
  }
}

export class HttpRequest extends Model {
  URL: string;
  Method: HttpMethod;
  QueryParams: StringToStringMap;
  Headers: StringToStringMap;
  constructor(id: string, name: string, url: string, method: HttpMethod) {
    super(id, name);
    this.URL = url;
    this.Method = method;
    this.QueryParams = {} as StringToStringMap;
    this.Headers = {} as StringToStringMap;
  }
}
export type CollectionChild = HttpRequest | Collection;
export class Collection extends Model {
  Children: CollectionChild[];
  constructor(id: string, name: string) {
    super(id, name);
    this.Children = [];
  }
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
