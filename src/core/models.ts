export interface Entity {
  Id: string;
  Type: string;
  Name: string;
}

export interface ZzzResponse {
  status: number;
  statusText: string;
  headers: StringToStringMap;
  data: any;
}
export default class ZzzRequest implements Entity {
  Id: string;
  Type = "Request";
  Name: string;
  URL: string;
  Method: "GET" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  QueryParams: StringToStringMap;
  Headers: StringToStringMap;
  Variables: StringToStringMap;
  Body: any;
  Authorization?: Auth;
  constructor(id: string, name: string, url: string, method: string) {
    this.Id = id;
    this.Name = name;
    this.URL = url;
    this.Method = method;
    this.QueryParams = {} as StringToStringMap;
    this.Headers = {} as StringToStringMap;
    this.Variables = {} as StringToStringMap;
  }
}
export class Collection implements Entity {
  Id: string;
  Type = "Collection";
  Name: string;
  Children: Folder[];
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
    this.Children = [];
  }
}
export class Folder implements Entity {
  Id: string;
  Type = "Folder";
  Name: string;
  Children: Item[];
  constructor(id: string, name: string) {
    this.Name = name;
    this.Id = id;
    this.Children = [];
  }
}
export type Item = ZzzRequest | Folder | string;

export interface StringToStringMap {
  [key: string]: string;
}

interface Auth {
  Type: string;
}
interface BearerTokenAuth extends Auth {
  BearerToken: string;
}
interface BasicAuthAuth extends Auth {
  BasicAuth: {
    username: string;
    password: string;
  };
}
interface HeaderAuth extends Auth {
  Header: {
    name: string; // e.g. X-API-TOKEN
    value: string; // e.g. {{_api_token}}
  };
}
interface QueryAuth extends Auth {
  Query: {
    name: string; // e.g. X-API-TOKEN
    value: string; // e.g. {{_api_token}}
  };
}
