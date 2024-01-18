import { processFlags } from "https://deno.land/x/flags_usage@2.0.0/mod.ts";
import FileStore from "../stores/files/index.ts";
import ClientActor from "./actors/client.ts";
import CurlActor from "./actors/curl.ts";
import PassThruActor from "./actors/pass.ts";
import SummaryActor from "./actors/summary.ts";
import Flags from "./flags.ts";
import { Args } from "https://deno.land/std/cli/parse_args.ts";
import { IModuleModifier, Module } from "../modules/module.ts";

interface IActor {
  act(theRequest: Entity): Promise<any>;
}
interface IStore {
  list(modelType: ModelType): Promise<Model[]>;
  get(modelType: ModelType, entityId: string): Promise<any>;
}
export const ModelTypes = [] as (typeof Model)[];
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
type FeatureMap = { [key: string]: Feature };
class Application {
  argv: Args;
  flags = { preamble: "Usage: zzz <options>" };
  feature = {} as FeatureMap;
  factory = new Factory();
  store?: IStore;
  executedModules = [] as Module[];
  modules = [] as Module[];
  constructor() {
    this.argv = processFlags(Deno.args, this.flags);
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
  registerModule(module: Module): void {
    this.argv = processFlags(Deno.args, this.flags);
    this.modules.push(module);
    if ('' has) {
    }
  }
  executeModules(): void {
  }
}

type Flag = {
  description: string;
  argument?: string;
  alias?: string;
  default?: any;
  type: "string" | "boolean";
};

export type { ApplicationConfig, IActor, IAuthorizer, IStore };

export default Application;
