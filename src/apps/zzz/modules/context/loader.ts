import { IStore } from "../../stores/mod.ts";
import { Collection } from "../requests/mod.ts";
import { Context } from "./mod.ts";

export const SESSION_CONTEXT = "session";
export const GLOBALS_CONTEXT = "globals";
const BLANK_ENTITY = {
  Id: "",
  Name: "",
} as Context;

export interface ILoader {
  globals(store: IStore): Promise<Context>;
  context(contextName: string, store: IStore): Promise<Context>;
  defaults(collectionPath: string, store: IStore): Promise<Context>;
  local(contextName: string, store: IStore): Promise<Context>;
}
// deno-lint-ignore no-explicit-any
export async function Apply(subject: any, defaults: any): Promise<void> {
  for (const key of Object.keys(defaults)) {
    if (key == "Id" || key == "Children") {
      continue;
    }
    if (key == "Body") { // TODO: BodyModule as dependency
      if (!subject.Body) {
        subject.Body = defaults.Body;
      }
      continue;
    }
    if (defaults[key] && typeof defaults[key] == "object") {
      if (!subject[key]) {
        if (Array.isArray(defaults[key])) {
          subject[key] = [];
        } else {
          subject[key] = {};
        }
        if (typeof subject[key] != typeof defaults[key]) {
          throw new Error("Mismatching types, source: " + typeof subject[key] + ", defaults: " + typeof defaults[key]);
        }
        return Apply(subject[key], defaults[key]);
      } else {
        await Apply(subject[key], defaults[key]);
      }
    } else {
      subject[key] = defaults[key];
    }
  }
  return Promise.resolve();
}

export default class Loader implements ILoader {
  async globals(store: IStore): Promise<Context> {
    return await this.context(GLOBALS_CONTEXT, store);
  }
  async local(contextName: string, store: IStore): Promise<Context> {
    return await this.context(contextName + ".local", store);
  }
  async context(contextName: string, store: IStore): Promise<Context> {
    try {
      return await store.get(Context.constructor.name, contextName) as Context; // TODO: Type wrong???
    } catch (_error) {
      return await Promise.resolve(BLANK_ENTITY);
    }
  }
  async defaults(subjectId: string, store: IStore): Promise<Context> {
    const defaults = new Context();
    while (subjectId.includes("/")) {
      subjectId = subjectId.substring(0, subjectId.lastIndexOf("/"));
      const parent = await store.get(Collection.name, subjectId);
      Apply(defaults, parent);
    }
    return Promise.resolve(defaults);
  }
}
