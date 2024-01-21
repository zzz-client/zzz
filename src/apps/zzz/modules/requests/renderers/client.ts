// import axios from "https://deno.land/x/redaxios/mod.ts";
import axios from "npm:axios";
import { HttpRequest } from "../mod.ts";
import { IModuleRenderer } from "../../../../../lib/module.ts";

export default class HttpClient implements IModuleRenderer {
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
