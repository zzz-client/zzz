import Application from "../../core/app.ts";
import { Entity, Model } from "../../core/models.ts";
import { IModule } from "../manager.ts";

export default class PathParamsModule implements IModule {
  static newInstance(_app: Application): IModule {
    return new PathParamsModule();
  }
  async mod(entity: Model): Promise<void> {
    if (entity.Type == "Entity") {
      await this.loadPathParams(entity as Entity);
    }
    return Promise.resolve();
  }
  loadPathParams(entity: Entity): Promise<void> {
    const pathParams = entity.PathParams;
    if (pathParams) {
      for (const key of Object.keys(pathParams)) {
        const value = pathParams[key];
        entity.URL = entity.URL.replace(":" + key, value);
      }
    }
    return Promise.resolve();
  }
}
