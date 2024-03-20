import { Action, StringToStringMap, Trace } from "../../etc.ts";
import { IModuleFields, IModuleModels, IModuleModifier, Module, ModuleFields } from "../../module.ts";
import { IStore, Model } from "../../storage/mod.ts";
import { HttpRequest, RequestsModule } from "../requests/mod.ts";

class HooksModule extends Module implements IModuleFields {
  Name = "Hooks";
  dependencies = [RequestsModule.name];
  fields = {
    Request: {
      Hooks: StringToStringMap,
    },
  };
}
