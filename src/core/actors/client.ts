// import axios from "https://deno.land/x/redaxios/mod.ts";
import axios from "npm:axios";
import { IActor } from "../app.ts";
import { Entity } from "../models.ts";
import { getDriver } from "../../stores/files/drivers.ts";

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
  let result = new Error(error);
  if (error.response?.data) {
    result = new Error(error.response.data);
  } else if (error.code) {
    result = new Error(error.code);
  }
  return error;
}
async function doRequest(theRequest: Entity): Promise<any> {
  return axios({
    method: theRequest.Method,
    headers: theRequest.Headers,
    params: theRequest.QueryParams,
    url: theRequest.URL,
    data: theRequest.Body,
  }).then((result) => {
    result.data;
    return result.data;
  }).then((derp) => {
    return Promise.reject(derp);
  });
}
