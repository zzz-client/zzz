import { IModuleModels, Module } from "../../module.ts";
import { Model, ParentModel } from "../../storage/mod.ts";
import { CollectionChild, RequestsModule } from "../requests/mod.ts";

export class ScopeModule extends Module implements IModuleModels {
  Name = "Scope";
  dependencies = [RequestsModule.name];
  models = [Scope.name];
}
export class Scope extends Model implements ParentModel {
  Children: CollectionChild[] = []; // TODO: Had | string at one point for some reason
}
