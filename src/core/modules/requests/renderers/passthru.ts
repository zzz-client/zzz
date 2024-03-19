import { IModuleRenderer } from "../../..//module.ts";
import { HttpRequest } from "../mod.ts";

export default class PassThru implements IModuleRenderer {
  render(theRequest: HttpRequest): Promise<HttpRequest> {
    return Promise.resolve(theRequest);
  }
}
