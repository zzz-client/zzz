import ModuleManager from "../modules/manager.ts";
import ClientActor from "./actors/client.ts";
import CurlActor from "./actors/curl.ts";
import PassThruActor from "./actors/pass.ts";
import SummaryActor from "./actors/summary.ts";
import { Entity, ModelType } from "./models.ts";
import FileStore from "./stores/file.ts";

interface IActor {
  act(theRequest: Entity): Promise<any>;
}
interface IStore {
  get(modelType: ModelType, entityId: string, contextName: string): Promise<any>;
  store(key: string, value: any, contextName: string): Promise<void>;
  setContext(context: string): void;
}
interface IAuthorizer {
  authorize(theRequest: Entity, authorizationConfig: any): void;
}
class Factory {
  async newStore(fileExtension: string): Promise<IStore> {
    return new FileStore(fileExtension);
  }
  async newActor(type: string): Promise<IActor> {
    switch (type) {
      default:
      case "Client":
        return new ClientActor();
      case "Summary":
        return new SummaryActor();
      case "Curl":
        return new CurlActor();
      case "Pass":
        return new PassThruActor();
    }
  }
}
interface ApplicationConfig {
  store: string;
  actor: string;
  modules: any[];
}
class Application {
  config: ApplicationConfig;
  modules: ModuleManager;
  actorType = "Client";
  factory = new Factory();
  store?: IStore;
  actor?: IActor;
  constructor(config: ApplicationConfig) {
    this.config = config;
    this.modules = new ModuleManager(config);
  }
  async getStore(): Promise<IStore> {
    if (!this.store) {
      this.store = await this.factory.newStore(this.config.store);
    }
    return this.store;
  }
  async getActor(): Promise<IActor> {
    if (!this.actor) {
      this.actor = await this.factory.newActor(this.actorType);
    }
    return this.actor;
  }
  async applyModules(theRequest: Entity): Promise<void> {
    this.modules.mod(theRequest);
  }
}

export type { ApplicationConfig, IActor, IAuthorizer, IStore };

export default Application;
