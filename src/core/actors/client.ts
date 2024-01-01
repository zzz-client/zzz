import axiod from "https://deno.land/x/axiod/mod.ts";
import { IActor } from "../actor.ts";
import { Parsers } from "../format.ts";
import Request from "../request.ts";

const defaultStringify = Parsers.JSON.stringify;

export default class ClientActor implements IActor {
  stringify: Function;
  constructor(stringify: Function = defaultStringify) {
    this.stringify = stringify;
  }
  async act(theRequest: Request): Promise<any> {
    try {
      console.log(`${theRequest.Method} ${theRequest.URL}`);
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
async function doRequest(theRequest: Request): Promise<any> {
  return (
    await axiod({
      method: theRequest.Method,
      headers: theRequest.Headers,
      params: theRequest.QueryParams,
      url: theRequest.URL,
      data: theRequest.Body,
    })
  ).data;
}
