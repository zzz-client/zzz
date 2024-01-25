import { IModuleModels, Module } from "../../../../lib/module.ts";
import { Model, ParentModel } from "../../../../storage/mod.ts";
import { CollectionChild, RequestsModule } from "../requests/mod.ts";

export class ScopeModule extends Module implements IModuleModels {
  dependencies = [RequestsModule.constructor.name];
  models = [Scope.constructor.name];
}
export class Scope extends Model implements ParentModel {
  Children: CollectionChild[] = []; // TODO: Had | string at one point for some reason
}
