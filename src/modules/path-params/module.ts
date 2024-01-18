import { Model } from "../../core/yeet.ts";
import { IModuleFields, IModuleModifier, Module } from "../module.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";

export class PathParamsModule extends Module implements IModuleFields, IModuleModifier {
  dependencies = [RequestsModule];
  fields = {
    PathParams: {
      type: "StringToStringMap",
      description: "Params to be replaced in the URL",
    },
  };
  async modify(entity: Model): Promise<void> {
    if (entity instanceof HttpRequest && PathParamsModule.hasFields(entity)) {
      await this.loadPathParams(entity as HttpRequest);
    }
    return Promise.resolve();
  }
  private loadPathParams(theRequest: HttpRequest): Promise<void> {
    const pathParams = (theRequest as any).PathParams;
    if (pathParams) {
      for (const key of Object.keys(pathParams)) {
        const value = pathParams[key];
        theRequest.URL = theRequest.URL.replace(":" + key, value);
      }
    }
    return Promise.resolve();
  }
}
