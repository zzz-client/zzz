import axios from "https://deno.land/x/redaxios/mod.ts";
import { IActor } from "../factories.ts";
import ZzzRequest from "../models.ts";
import { Parsers } from "../stores/file.ts";

const defaultStringify = Parsers.JSON.stringify;

export default class ClientActor implements IActor {
  stringify: Function;
  constructor(stringify: Function = defaultStringify) {
    this.stringify = stringify;
  }
  async act(theRequest: ZzzRequest): Promise<any> {
    try {
      return await doRequest(theRequest);
    } catch (error) {
      throw formatError(error);
    }
  }
}
function formatError(error: any) {
  if (error.response && error.response.data) {
    return error.response.data;
  }
  if (error.code) {
    return new Error(error.code);
  }
  return error;
}
async function doRequest(theRequest: ZzzRequest): Promise<any> {
  return (
    await axios({
      method: theRequest.Method,
      headers: theRequest.Headers,
      params: theRequest.QueryParams,
      url: theRequest.URL,
      data: theRequest.Body,
    })
  ).data;
}
