// deno-lint-ignore-file

import { IStore, Model } from "../storage/mod.ts";

export { describe, it } from "https://deno.land/std/testing/bdd.ts";
export { fail } from "https://deno.land/std/assert/fail.ts";
export { assertEquals } from "https://deno.land/std/assert/mod.ts";
export { assertSpyCall, resolvesNext, returnsNext, stub } from "https://deno.land/x/mock/mod.ts";

export class TestStore implements IStore {
  get(modelType: string, id: string): Promise<Model> {
    throw new Error("Method not implemented.");
  }
  set(modelType: string, model: Model): Promise<void> {
    throw new Error("Method not implemented.");
  }
  move(modelType: string, oldId: string, newId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  search(searchParams: string): Promise<Model[]> {
    throw new Error("Method not implemented.");
  }
  list(modelType: string): Promise<Model[]> {
    throw new Error("Method not implemented.");
  }
  getModelType(id: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
