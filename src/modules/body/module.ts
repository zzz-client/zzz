import { Model } from "../../core/yeet.ts";
import { IModuleFields, IModuleModifier, Module } from "../../core/module.ts";
import Action from "../../core/action.ts";
import { HttpRequest, RequestsModule } from "../requests/module.ts";

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
      console.log("Body module executing on: ", _action);
      await this.loadBody(entity);
    }
    console.log(entity);
  }
  private loadBody(entity: Model): Promise<void> {
    let body = (entity as any).Body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
    if (body) {
      (entity as any).Body = body;
    }
    return Promise.resolve();
  }
}
