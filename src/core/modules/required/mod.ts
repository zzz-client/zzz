import { Trace } from "../../../../lib/etc.ts";
import { IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest } from "../requests/mod.ts";

export default class RequiredModule extends Module implements IModuleModifier {
  Name = "Required";
  dependencies = [];
  modify(theRequest: Model): Promise<void> {
    Trace("RequiredModule:modify");
    if (theRequest instanceof HttpRequest) {
      checkRequired(theRequest);
    }
    return Promise.resolve();
  }
}
const REQUIRED_ON_REQUEST = ["Method", "URL"];
// deno-lint-ignore no-explicit-any
function checkRequired(fileContents: any): void {
  for (const key of REQUIRED_ON_REQUEST) {
    if (!fileContents[key]) {
      throw new Error(`Missing required key ${key}`);
    }
  }
}
