export interface Entity {
  Type: string;
  Name: string;
}

export interface Response {
  status: number;
  statusText: string;
  headers: StringToStringMap;
  data: any;
}
export default class ZzzRequest implements Entity {
  Type = "Request";
  Name: string;
  URL: string;
  Method: string;
  QueryParams: StringToStringMap;
  Headers: StringToStringMap;
  Variables: StringToStringMap;
  Body: any;
  constructor(name: string, url: string, method: string) {
    this.Name = name;
    this.URL = url;
    this.Method = method;
    this.QueryParams = {} as StringToStringMap;
    this.Headers = {} as StringToStringMap;
    this.Variables = {} as StringToStringMap;
  }
}
export class Collection {
  Type = "Collection";
  Name: string;
  Children: Folder[];
  constructor(name: string) {
    this.Name = name;
    this.Children = [];
  }
}
export class Folder {
  Type = "Folder";
  Name: string;
  Children: Item[];
  constructor(name: string) {
    this.Name = name;
    this.Children = [];
  }
}
export type Item = ZzzRequest | Folder | string;

export interface StringToStringMap {
  [key: string]: string;
}
