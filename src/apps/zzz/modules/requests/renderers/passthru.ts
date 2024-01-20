// import axios from "https://deno.land/x/redaxios/mod.ts";
import { HttpRequest } from "../module.ts";
import { IModuleRenderer } from "../../module.ts";

export default class PassThru implements IModuleRenderer {
  render(theRequest: HttpRequest): Promise<HttpRequest> {
    return Promise.resolve(theRequest);
  }
}
