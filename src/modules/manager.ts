import { ApplicationConfig } from "../core/app.ts";
import { Model } from "../core/models.ts";
import Application from "../core/app.ts";

export interface ModuleConfig extends ApplicationConfig {}
export default class ModuleManager {
  modules = [] as IModule[];
  app: Application;
  constructor(app: Application) {
    this.app = app;
    for (const module of app.config.modules) {
      this.modules.push(module.newInstance(app));
    }
  }
  async mod(theModel: Model, config: moduleConfig): Promise<void> {
    for (const module of this.modules) {
      await module.mod(theModel, config);
    }
    return Promise.resolve();
  }
}
export interface IModule {
  mod(model: Model, app: ModuleConfig): Promise<void>;
}
