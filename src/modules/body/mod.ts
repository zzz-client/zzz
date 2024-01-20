import { Model } from "../../core/yeet.ts";
import { IModuleFields, IModuleModifier, Module } from "../../core/module.ts";
import Action from "../../core/action.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

export class BodyModule extends Module implements IModuleModifier, IModuleFields {
  dependencies = [RequestsModule];
  fields = {
    Body: {
      type: Object, // TODO: Complicated
    },
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
