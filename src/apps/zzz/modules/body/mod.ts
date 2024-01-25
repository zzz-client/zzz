import { Action, asAny, Trace } from "../../../../lib/lib.ts";
import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class BodyModule extends Module implements IModuleModifier, IModuleFields {
  dependencies = [RequestsModule.constructor.name];
  fields = {
    HttpRequest: BodyFields,
  };
  async modify(entity: Model, _action: Action): Promise<void> {
    Trace("BodyModule:modify");
    if (BodyModule.hasFields(entity) && entity instanceof HttpRequest) {
      await this.loadBody(entity);
    }
  }
  private loadBody(entity: Model): Promise<void> {
    let body = asAny(entity).Body;
    if (typeof body === "string") {
      body = JSON.parse(body); // TODO: read it if it's a text doc, attach it as binary if it's binary?
    }
    if (body) {
      asAny(entity).Body = body;
    }
    return Promise.resolve();
  }
}

class BodyFields {
  Body!: string | object;
}
