import { StringToStringMap } from "../../etc.ts";
import { IModuleFields, Module } from "../../module.ts";
import { RequestsModule } from "../requests/mod.ts";

export class Hooks implements StringToStringMap {
  [key: string]: string;
}

export class HooksModule extends Module implements IModuleFields {
  Name = "Hooks";
  dependencies = [RequestsModule.name];
  fields = {
    Request: {
      Hooks: Hooks,
    },
  };
}
