import { Model, StringToStringMap } from "../../core/yeet.ts";
import { Flag, IModuleFields, IModuleFlags, IModuleModels, IModuleModifier, Module, ModuleField } from "../module.ts";

export class RequestsModule extends Module implements IModuleFlags, IModuleModels, IModuleFields, IModuleModifier {
  dependencies = [];
  flags: Flag[] = [
    {
      name: "execute",
      description: "Execute request",
      type: "boolean",
      argument: "request",
      alias: "x",
    },
  ];
  models: (typeof Model)[] = [HttpRequest, Collection]; // TODO: Why is this constructor a problem
  fields = {
    HttpRequest: {
      url: "string",
      method: HttpMethod, // TODO: why undefined
      headers: StringToStringMap, // TODO: why undefined
      description: "Params to be replaced in the URL",
    } as ModuleField,
  };
  modify(model: Model): Promise<void> {
    // TODO
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
