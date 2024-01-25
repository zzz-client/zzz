import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Action, asAny } from "../../../../lib/lib.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";
import { Model } from "../../../../storage/mod.ts";

export class BodyModule extends Module implements IModuleModifier, IModuleFields {
  dependencies = [RequestsModule.constructor.name];
  fields = {
    HttpRequest: BodyFields,
  };
  async modify(entity: Model, _action: Action): Promise<void> {
    if (
      entity instanceof HttpRequest &&
      BodyModule.hasFields(entity)
    ) {
      await this.loadBody(entity);
    }
  }
  private loadBody(entity: Model): Promise<void> {
    let body = asAny(entity).Body;
    if (typeof body === "string") {
      body = JSON.parse(body); // TODO: read it if it's a text doc, attach it as binary if it's binary?
    }
    if (body) {
      (entity as any).Body = body;
    }
    return Promise.resolve();
  }
}

class BodyFields {
  Body!: string | object;
}
