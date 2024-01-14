import { Entity, Model } from "../core/models.ts";
import { IModule, ModuleConfig } from "./manager.ts";

export default class BodyModule implements IModule {
  async mod(entity: Model, config: ModuleConfig): Promise<void> {
    if (entity.Type == "Request") {
      await this.loadBody(entity as Entity, entity.Id);
    }
  }
  loadBody(entity: Entity, _requestFilePath: string): Promise<void> {
    if (typeof entity.Body === "string") {
      entity.Body = JSON.parse(entity.Body);
    }
    if (!entity.Body) {
      entity.Body = null;
    }
    return Promise.resolve();
  }
}
