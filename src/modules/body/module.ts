import { Model } from "../../core/yeet.ts";
import { IModuleFields, IModuleModifier, Module } from "../module.ts";
import { RequestsModule } from "../requests/module.ts";

export class BodyModule extends Module implements IModuleModifier, IModuleFields {
  dependencies = [RequestsModule];
  fields = {
    Body: {
      type: Object, // TODO: Complicated
    },
  };
  async modify(entity: Model): Promise<void> {
    if (BodyModule.hasFields(entity)) {
      await this.loadBody(entity, entity.Id);
    }
  }
  loadBody(entity: Model, _requestFilePath: string): Promise<void> {
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
