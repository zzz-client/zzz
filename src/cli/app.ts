import IApplication, { ConfigValue, Flags } from "../core/app.ts";
import DI from "../core/di.ts";
import { asAny, StringToStringMap, Trace } from "../core/etc.ts";
import { IModuleFeatures, IModuleRenderer, Module } from "../core/module.ts";

import { initDi } from "../app.ts";
import { Args, Command, parseFlags } from "../core/deps.ts";
import { AuthorizationModule } from "../core/modules/auth/mod.ts";
import { BodyModule } from "../core/modules/body/mod.ts";
import { ContextModule } from "../core/modules/context/mod.ts";
import { CookiesModule } from "../core/modules/cookies/mod.ts";
import { HooksModule } from "../core/modules/hooks/mod.ts";
import { PathParamsModule } from "../core/modules/path-params/mod.ts";
import { RedactModule } from "../core/modules/redact/mod.ts";
import { RequestsModule } from "../core/modules/requests/mod.ts";
import { ScopeModule } from "../core/modules/scope/mod.ts";
import TemplateModule from "../core/modules/template/mod.ts";
import { IStore } from "../core/storage/mod.ts";
import { configureFullCommand, configureRunnerCommand, constructCliCommand } from "./cli.ts";

export default class Application implements IApplication {
  store: IStore;
  flags = {
    _: [],
    preamble: "Usage: zzz <options>",
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
    this.cmd = constructCliCommand();
    this.store = DI.newInstance("IStore") as IStore;
    this.registerModule(new HooksModule(this.store));
    this.registerModule(new RequestsModule(this.store));
    this.registerModule(new ScopeModule(this.store));
    this.registerModule(new ContextModule(this.store));
    this.registerModule(new PathParamsModule(this.store));
    this.registerModule(new BodyModule(this.store));
    this.registerModule(new AuthorizationModule(this.store));
    this.registerModule(new TemplateModule(this.store));
    this.registerModule(new CookiesModule(this.store));
    this.registerModule(new RedactModule(this.store));
    this.argv = parseFlags(Deno.args, this.flags);

    if (Deno.env.get("ZZZ_MODE") == "file") {
      configureRunnerCommand(this.cmd);
    } else {
      configureFullCommand(this.cmd, this);
    }
  }
  async run(): Promise<void> {
    await this.cmd.parse(Deno.args);
  }
  registerModule(module: Module): void {
    loadFlagsFromFeatures(this, module);
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

function loadFlagsFromFeatures(app: Application, module: Module): void {
  if ("features" in module) { // TODO: is there a better way to do this?
    Trace("Loading flags for", module.Name);
    for (const flag of (module as unknown as IModuleFeatures).features) {
      if (flag.type == "string[]") {
        if (!flag.hidden) {
          throw new Error(`List feature ${flag.name} must be hidden.`);
        }
        if (flag.default || flag.argument || flag.alias) {
          throw new Error(`List feature ${flag.name} cannot be a flag.`);
        }
        asAny(app.flags)[flag.name] = [];
      } else {
        asAny(app.flags)[flag.type].push(flag.name);
        app.flags.description[flag.name] = flag.description;
        let cmdOption = `--${flag.name}`;
        if (flag.alias) {
          app.flags.alias[flag.name] = flag.alias;
          cmdOption = `-${flag.alias}, ${cmdOption}`;
        }
        if (flag.default) {
          app.flags.default[flag.name] = flag.default;
        }
        if (flag.type != "boolean") {
          cmdOption += ` [${flag.name}:${flag.type}]`;
        }
        app.cmd.globalOption(cmdOption, flag.description, { default: flag.default });
      }
    }
  }
}

if (asAny(import.meta).main) {
  initDi();
  new Application().run();
}

// TODO: Tests
