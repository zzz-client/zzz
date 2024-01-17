import { processFlags } from "https://deno.land/x/flags_usage@2.0.0/mod.ts";
import ModuleManager from "../modules/manager.ts";
import ClientActor from "./actors/client.ts";
import CurlActor from "./actors/curl.ts";
import PassThruActor from "./actors/pass.ts";
import SummaryActor from "./actors/summary.ts";
import { Entity, Model, ModelType } from "./models.ts";
import FileStore from "../stores/files/index.ts";
import Flags from "./flags.ts";

interface IActor {
  act(theRequest: Entity): Promise<any>;
}
interface IStore {
  list(modelType: ModelType.Scope | ModelType.Context | ModelType.Authorization): Promise<Model[]>;
  get(modelType: ModelType, entityId: string): Promise<any>;
  store(key: string, value: any, contextName: string): Promise<void>;
}
interface IAuthorizer {
  authorize(model: Model, authorizationConfig: any): void;
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
  factory = new Factory();
  store?: IStore;
  actor?: IActor;
  argv = processFlags(Deno.args, Flags);
  constructor(config: ApplicationConfig) {
    this.config = config;
    this.modules = new ModuleManager(this);
  }
  async getStore(): Promise<IStore> {
    if (!this.store) {
      this.store = await this.factory.newStore(this.config.store);
    }
    return this.store;
  }
  async getActor(actorType: string): Promise<IActor> {
    return await this.factory.newActor(actorType);
  }
  async applyModules(model: Model): Promise<void> {
    return this.modules.mod(model, this.config);
  }
}

export type { ApplicationConfig, IActor, IAuthorizer, IStore };

export default Application;
