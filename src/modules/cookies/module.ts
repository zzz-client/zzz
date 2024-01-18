import { Model } from "../../core/yeet.ts";
import { Module } from "../module.ts";
import { CollectionChild, HttpRequest, RequestsModule } from "../requests/module.ts";

export class CookieModule extends Module {
  dependencies = [RequestsModule];
  async modify(model: Model): Promise<void> {
    if (model instanceof HttpRequest) {
      await this.loadCookies(model);
    }
  }
  loadCookies(theRequest: HttpRequest): Promise<void> {
    // TODO loadCookies
    return Promise.resolve();
  }
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
