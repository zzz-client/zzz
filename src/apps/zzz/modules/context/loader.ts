import { IStore } from "../../../../storage/mod.ts";
import { Collection } from "../requests/mod.ts";
import { Context } from "./mod.ts";

export const SESSION_CONTEXT = "session";
export const GLOBALS_CONTEXT = "globals";
const BLANK_ENTITY = {
  Id: "",
  Name: "",
} as Context;

export interface ILoader {
  globals(): Promise<Context>;
  context(contextName: string): Promise<Context>;
  defaults(collectionPath: string): Promise<Context>;
  local(contextName: string): Promise<Context>;
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
        await Apply(subject[key], defaults[key]); // this used to be return instead of await
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
  private store: IStore;
  constructor(store: IStore) {
    this.store = store;
  }
  async globals(): Promise<Context> {
    return await this.context(GLOBALS_CONTEXT);
  }
  async local(contextName: string): Promise<Context> {
    return await this.context(contextName + ".local");
  }
  async context(contextName: string): Promise<Context> {
    try {
      return await this.store.get(Context.name, contextName) as Context; // TODO: Type wrong???
    } catch (_error) {
      return await Promise.resolve(BLANK_ENTITY);
    }
  }
  async defaults(subjectId: string): Promise<Context> {
    const defaults = new Context();
    while (subjectId.includes("/")) {
      subjectId = subjectId.substring(0, subjectId.lastIndexOf("/"));
      const parent = await this.store.get(Collection.name, subjectId);
      Apply(defaults, parent);
    }
    return Promise.resolve(defaults);
  }
}

// ----------------------------------------- TESTS -----------------------------------------

import { describe, fail, it } from "../../../../lib/tests.ts";

describe("Apply", () => {
  it("skips Id and Children", async () => {
    // fail("Write this test");
  });
  it("loads Body", async () => {
    // fail("Write this test");
  });
  it("sets values", async () => {
    // fail("Write this test");
  });
});

describe("Context Loader", () => {
  it("globals", async () => {
    // fail("Write this test");
  });
  it("local", async () => {
    // fail("Write this test");
  });
  it("context", async () => {
    // fail("Write this test");
  });
  it("defaults", async () => {
    // fail("Write this test");
  });
});
