import Application from "../../core/app.ts";
import tim from "../../core/tim.ts";
import { Entity, Model } from "../../core/models.ts";
import { IModule, ModuleConfig } from "../manager.ts";

export default class PathParamsModule implements IModule {
  static newInstance(app: Application): IModule {
    return new PathParamsModule();
  }
  async mod(entity: Model): Promise<void> {
    if (entity.Type == "Entity") {
      await this.loadPathParams(entity as Entity, entity.Id);
    }
    return Promise.resolve(entity);
  }
  loadPathParams(entity: Entity, entityId: string): Promise<void> {
    let pathParams = entity.PathParams;
    if (pathParams) {
      for(const key of Object.keys(pathParams)){
        const value = pathParams[key];
        entity.URL = entity.URL.replace(':' + key, value); 
      }
    }
    return Promise.resolve();
  }
}
