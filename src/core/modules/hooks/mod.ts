import { Action, StringToStringMap, Trace } from "../../etc.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module, ModuleFields } from "../../module.ts";
import { IStore, Model } from "../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

class Hook {
  Type!: string;
  Run!: string;
}
class Hooks {
  Before!: Hook;
  After!: Hook;
}

abstract class HooksModule extends Module implements IModuleFields {
  Name = "Hooks";
  dependencies = [RequestsModule.name];
  fields = {
    Request: {
      Hooks: Hooks,
    },
  };
}

export class BeforeHooksModule extends HooksModule {}
export class AfterHooksModule extends HooksModule {}
