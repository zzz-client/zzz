import Application from "../../core/app.ts";
import { Entity, Model } from "../../core/models.ts";
import { IModule } from "../manager.ts";

export default class CookieModule implements IModule {
  app: Application;
  static newInstance(app: Application): IModule {
    return new CookieModule(app);
  }
  constructor(app: Application) {
    this.app = app;
  }
  async mod(entity: Model): Promise<void> {
    if (entity.Type == "Entity") {
      await this.loadCookies(entity as Entity, entity.Id);
    }
  }
  loadCookies(entity: Entity, _requestFilePath: string): Promise<void> {
    // TODO
    return Promise.resolve();
  }
}
