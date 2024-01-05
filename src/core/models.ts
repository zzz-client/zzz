interface Model {
  Id: string;
  Type: string;
  Name: string;
}
enum ModelType {
  Authorization,
  Context,
  Entity,
  Collection,
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

class Entity implements Model {
  Type = "Request";
  Id: string;
  Name: string;
  URL: string;
  Method: HttpMethod;
  QueryParams: StringToStringMap;
  Headers: StringToStringMap;
  Variables: StringToStringMap;
  Body: string | any;
  Authorization?: Auth;
  constructor(id: string, name: string, url: string, method: HttpMethod) {
    this.Id = id;
    this.Name = name;
    this.URL = url;
    this.Method = method;
    this.QueryParams = {} as StringToStringMap;
    this.Headers = {} as StringToStringMap;
    this.Variables = {} as StringToStringMap;
  }
}
type CollectionChild = Model | Collection;
class Collection implements Model {
  Type = "Collection";
  Id: string;
  Name: string;
  Children: CollectionChild[];
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
    this.Children = [];
  }
}
class Context implements Model {
  Type = "Context";
  Id: string;
  Name: string;
  Collections: Collection[];
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
    this.Collections = [];
  }
}

interface Auth {
  Type: string;
}
export interface StringToStringMap {
  [key: string]: string;
}

export { Collection, Context, Entity, ModelType };
export type { Auth, HttpMethod, Model };
