// import axios from "https://deno.land/x/redaxios/mod.ts";

import { IModuleRenderer } from "../../../../../lib/module.ts";
import { HttpRequest } from "../mod.ts";

export default class PassThru implements IModuleRenderer {
  render(theRequest: HttpRequest): Promise<HttpRequest> {
    return Promise.resolve(theRequest);
  }
}
