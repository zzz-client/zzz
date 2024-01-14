import axios from "https://deno.land/x/redaxios/mod.ts";
import { IActor } from "../app.ts";
import { Entity } from "../models.ts";
import { getDriver } from "../files/drivers.ts";

const defaultStringify = getDriver(".json").stringify;

export default class ClientActor implements IActor {
  stringify: Function;
  constructor(stringify: Function = defaultStringify) {
    this.stringify = stringify;
  }
  async act(theRequest: Entity): Promise<any> {
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
async function doRequest(theRequest: Entity): Promise<any> {
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
