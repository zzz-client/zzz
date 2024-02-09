import axios from "https://deno.land/x/redaxios/mod.ts";
import { HttpRequest } from "../modules/requests/mod.ts";
import { asAny } from "../../../lib/etc.ts";
import { FileFormat } from "../../../storage/files/formats.ts";
import { Model } from "../../../storage/mod.ts";

// TODO: Move to own file?
export interface IActor {
  act(theRequest: Model): Promise<any>;
}

export default class ExecuteActor implements IActor {
  async act(theModel: Model): Promise<any> {
    try {
      return await doRequest(theModel as HttpRequest); // TODO: Naughty cast
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
async function doRequest(theRequest: HttpRequest): Promise<any> {
  return (
    await axios({
      method: theRequest.Method,
      headers: theRequest.Headers,
      params: theRequest.QueryParams,
      url: theRequest.URL,
      data: asAny(theRequest).Body,
    })
  ).data;
}
