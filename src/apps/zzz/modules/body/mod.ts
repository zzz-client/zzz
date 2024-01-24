import { Action, Trace } from "../../../../lib/lib.ts";
import { IModuleFields, IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class BodyModule extends Module implements IModuleModifier, IModuleFields {
  dependencies = [RequestsModule.constructor.name];
  fields = {
    Body: {
      type: Object, // TODO: Complicated
    },
  };
  async modify(entity: Model, _action: Action): Promise<void> {
    Trace("BodyModule:modify");
    if (
      entity instanceof HttpRequest &&
      BodyModule.hasFields(entity)
    ) {
      await this.loadBody(entity);
    }
  }
  private loadBody(entity: Model): Promise<void> {
    let body = (entity as any).Body;
    if (typeof body === "string") {
      body = JSON.parse(body); // TODO: read it if it's a text doc, attach it as binary if it's binary?
    }
    if (body) {
      (entity as any).Body = body;
    }
    return Promise.resolve();
  }
}
