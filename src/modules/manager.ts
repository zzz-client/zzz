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
  async mod(theRequest: Model) {
    for (const module of this.modules) {
      module.mod(theRequest, this.app.config);
    }
  }
}
export interface IModule {
  mod(theRequest: Model, app: ModuleConfig): Promise<void>;
}
