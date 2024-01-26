import { Action, asAny, Trace } from "../../../../lib/lib.ts";
import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class PathParamsModule extends Module implements IModuleFields, IModuleModifier {
  Name = "PathParams";
  dependencies = [RequestsModule.name];
  fields = {
    PathParams: {
      type: "StringToStringMap",
      description: "Params to be replaced in the URL",
    },
  };
  async modify(entity: Model, _action: Action): Promise<void> {
    Trace("PathParamsModule:modify");
    if (entity instanceof HttpRequest && PathParamsModule.hasFields(entity)) {
      await this.loadPathParams(entity as HttpRequest);
    }
    return Promise.resolve();
  }
  private loadPathParams(theRequest: HttpRequest): Promise<void> {
    const pathParams = asAny(theRequest).PathParams;
    if (pathParams) {
      for (const key of Object.keys(pathParams)) {
        const value = pathParams[key];
        theRequest.URL = theRequest.URL.replace(":" + key, value);
      }
    }
    return Promise.resolve();
  }
}
