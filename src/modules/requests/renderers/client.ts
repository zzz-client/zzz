// import axios from "https://deno.land/x/redaxios/mod.ts";
import axios from "npm:axios";
import { getFileFormat } from "../../../stores/files/formats.ts";
import { HttpRequest } from "../module.ts";
import { IModuleRenderer } from "../../module.ts";

const defaultStringify = getFileFormat(".json").stringify;

export default class HttpClient implements IModuleRenderer {
  stringify: Function;
  constructor(stringify: Function = defaultStringify) {
    this.stringify = stringify;
  }
  async render(theRequest: HttpRequest): Promise<void> {
    try {
      return await doRequest(theRequest);
    } catch (error) {
      throw formatError(error);
    }
  }
}
function formatError(error: any) {
  let result = new Error(error);
  if (error.response?.data) {
    result = new Error(error.response.data);
  } else if (error.code) {
    result = new Error(error.code);
  }
  return result;
}
function doRequest(theRequest: HttpRequest): Promise<any> {
  return axios({
    method: theRequest.Method,
    headers: theRequest.Headers,
    params: theRequest.QueryParams,
    url: theRequest.URL,
    data: (theRequest as any).Body, // TODO: any
  }).then((result) => {
    result.data;
    return result.data;
  }).then((derp) => {
    return Promise.reject(derp);
  });
}
