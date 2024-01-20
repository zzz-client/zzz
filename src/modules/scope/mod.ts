import { Model } from "../../lib/lib.ts";
import { IModuleModels, Module } from "../../lib/module.ts";
import { CollectionChild, RequestsModule } from "../requests/mod.ts";

export class ScopeModule extends Module implements IModuleModels {
  dependencies = [RequestsModule];
  models = [Scope];
}
export class Scope implements Model {
  Type = "Scope";
  Id: string;
  Name: string;
  Children: (CollectionChild | string)[];
  constructor(id: string, name: string) {
    this.Id = id;
    this.Name = name;
    this.Children = [];
  }
}
