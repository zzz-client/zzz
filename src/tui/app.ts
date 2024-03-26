import DI from "../core/di.ts";
import { asAny, StringToStringMap } from "../core/etc.ts";
import { IModuleRenderer, Module } from "../core/module.ts";
import IApplication, { ConfigValue, Flags } from "../core/app.ts";
import Tui from "./tui.ts";

import { Args, Command, processFlags } from "../core/deps.ts";
import { IStore } from "../core/storage/mod.ts";
import { AuthorizationModule } from "../core/modules/auth/mod.ts";
import { BodyModule } from "../core/modules/body/mod.ts";
import { ContextModule } from "../core/modules/context/mod.ts";
import { CookiesModule } from "../core/modules/cookies/mod.ts";
import { PathParamsModule } from "../core/modules/path-params/mod.ts";
import { RedactModule } from "../core/modules/redact/mod.ts";
import { RequestsModule } from "../core/modules/requests/mod.ts";
import { ScopeModule } from "../core/modules/scope/mod.ts";
import TemplateModule from "../core/modules/template/mod.ts";
import { HooksModule } from "../core/modules/hooks/mod.ts";
import createAppCommand, { initDi } from "../app.ts";

export default class Application implements IApplication {
  store = DI.newInstance("IStore") as IStore;
  flags = {
    _: [],
    preamble: "Usage: zzz",
    string: [],
    boolean: ["trace"] as string[],
    description: {} as StringToStringMap,
    argument: {} as StringToStringMap,
    default: {} as { [key: string]: ConfigValue },
    alias: {} as StringToStringMap,
  } as Flags;
  env = {} as StringToStringMap;
  argv: Args;
  cmd: Command;
  loadedModules = [] as Module[];
  modules = [] as Module[];
  renderers = [] as IModuleRenderer[];
  constructor() {
    this.env = Deno.env.toObject();
    this.cmd = createAppCommand();
    this.registerModule(new HooksModule(this.store));
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
    return Tui(this);
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

if (asAny(import.meta).main) {
  initDi();
  await new Application().run();
}

// TODO: Tests
