import { Model } from "../../core/yeet.ts";
import { IModuleModels, Module } from "../../core/module.ts";
import { CollectionChild, RequestsModule } from "../requests/module.ts";

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
