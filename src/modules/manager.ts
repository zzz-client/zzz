import { ApplicationConfig } from "../core/app.ts";
import ZzzRequest from "../core/models.ts";

export interface ModuleConfig extends ApplicationConfig {}
export default class ModuleManager {
  modules = [] as IModule[];
  config: ModuleConfig;
  constructor(config: ModuleConfig) {
    this.config = config;
    for (const module of this.config.modules) {
      this.modules.push(module.newInstance(config));
    }
  }
  async mod(theRequest: ZzzRequest) {
    for (const module of this.modules) {
      module.mod(theRequest, this.config);
    }
  }
}
interface IModule {
  mod(theRequest: ZzzRequest, config: ModuleConfig): Promise<void>;
}
