export default class Request {
  URL: string;
  Method: string;
  QueryParams: StringToStringMap;
  Headers: StringToStringMap;
  Variables: StringToStringMap;
  Body: any;
  constructor(url: string, method: string) {
    this.URL = url;
    this.Method = method;
    this.QueryParams = {} as StringToStringMap;
    this.Headers = {} as StringToStringMap;
    this.Variables = {} as StringToStringMap;
  }
}

export interface StringToStringMap {
  [key: string]: string;
}
