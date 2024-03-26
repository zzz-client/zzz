import IApplication from "../../app.ts";
import { Feature, IModuleModels, Module } from "../../module.ts";
import { Model, ParentModel } from "../../storage/mod.ts";
import MultiStore from "../../stores/multi.ts";
import { CollectionChild, RequestsModule } from "../requests/mod.ts";
import DI from "../../di.ts";
import { IStore } from "../../storage/mod.ts";

export class ScopeModule extends Module implements IModuleModels {
  Name = "Scope";
  dependencies = [RequestsModule.name];
  features: Feature[] = [{
    name: "scope",
    alias: "s",
    description: "Manually supplied scope",
    type: "string",
  }];
  models = [Scope.name];
  constructor(store: IStore) {
    super(store);
    const scope = Deno.env.get("ZZZ_SCOPE") as string; // TODO: The rest of this
    // TODO: Somehow overwrite app.store to be new MultiStore([scope])
    DI.register("IStore", () => new MultiStore([scope]));
  }
}
export class Scope extends Model implements ParentModel {
  Children: CollectionChild[] = [];
}
