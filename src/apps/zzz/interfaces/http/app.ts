import { Args, processFlags } from "../../../../lib/deps.ts";
import DI from "../../../../lib/di.ts";
import { Action, StringToStringMap } from "../../../../lib/etc.ts";
import { IModuleRenderer, Module } from "../../../../lib/module.ts";
import { IStore, Model } from "../../../../storage/mod.ts";
import IApplication, { ConfigValue, executeModules, Flags } from "../../../mod.ts";
import { initDi } from "../../app.ts";
import { AuthorizationModule } from "../../modules/auth/mod.ts";
import { BodyModule } from "../../modules/body/mod.ts";
import { ContextModule } from "../../modules/context/mod.ts";
import { CookiesModule } from "../../modules/cookies/mod.ts";
import { PathParamsModule } from "../../modules/path-params/mod.ts";
import { RedactModule } from "../../modules/redact/mod.ts";
import { RequestsModule } from "../../modules/requests/mod.ts";
import { ScopeModule } from "../../modules/scope/mod.ts";
import TemplateModule from "../../modules/template/mod.ts";
import { listen, Server } from "./http.ts";

initDi();

export default class Application implements IApplication {
  store = DI.newInstance("IStore") as IStore;
  flags = {
    preamble: "Usage: zzz <options>",
    string: [],
    boolean: ["trace"] as string[],
    description: {} as StringToStringMap,
    argument: {} as StringToStringMap,
    default: {} as { [key: string]: ConfigValue },
    alias: {} as StringToStringMap,
  } as Flags;
  argv: Args;
  env = {} as StringToStringMap;
  loadedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    this.env = Deno.env.toObject();
    this.registerModule(new RequestsModule(this.store));
    this.registerModule(new BodyModule(this.store));
    this.registerModule(new PathParamsModule(this.store));
    this.registerModule(new ScopeModule(this.store));
    this.registerModule(new ContextModule(this.store));
    this.registerModule(new AuthorizationModule(this.store));
    this.registerModule(new TemplateModule(this.store));
    this.registerModule(new CookiesModule(this.store));
    this.registerModule(new RedactModule(this.store));
    this.argv = processFlags(Deno.args, this.flags);
  }
  run(): Promise<void> {
    return listen(new Server(this));
  }
  async getModel(id: string, action: Action): Promise<Model> {
    const model = { Id: id } as Model;
    await executeModules(this.modules, action, model);
    return model;
  }
  async updateModel(model: Model): Promise<void> {
    const modelType = await this.store.getModelType(model.Id);
    this.store.set(modelType, model);
  }
  registerModule(module: Module): void {
    /*
    if (module instanceof IModuleModels) {
      // TODO: IModuleModels
    }
    if (module instanceof IModuleFields) {
      // TODO: IModuleFields
    }
    if (module instanceof IModuleRenderer) {
      // TODO: IModuleRenderer
    }
    */
    this.modules.push(module);
  }
}

// TODO: Tests
