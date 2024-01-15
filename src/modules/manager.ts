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
  async mod(theModel: Model, request: Request) {
    for (const module of this.modules) {
      module.mod(request, theModel, this.app.config);
    }
  }
}
export interface IModule {
  mod(app: ModuleConfig, model: Model): Promise<void>;
}
