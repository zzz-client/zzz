import Application from "../../core/app.ts";
import { Entity, Model } from "../../core/models.ts";
import { IModule, ModuleConfig } from "../manager.ts";

export default class BodyModule implements IModule {
  static newInstance(app: Application): IModule {
    return new BodyModule();
  }
  async mod(entity: Model): Promise<void> {
    if (entity.Type == "Entity") {
      await this.loadBody(entity as Entity, entity.Id);
    }
  }
  loadBody(entity: Entity, _requestFilePath: string): Promise<void> {
    let body = entity.Body;
    if (typeof entity.Body === "string") {
      body = JSON.parse(entity.Body);
    }
    if (body) {
      entity.Body = body;
    }
    return Promise.resolve();
  }
}
