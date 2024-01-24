import { Trace } from "../../../../lib/lib.ts";
import { IModuleModifier, Module } from "../../../../lib/module.ts";
import { Model } from "../../../../storage/mod.ts";
import { HttpRequest } from "../requests/mod.ts";

export default class RequiredModule extends Module implements IModuleModifier {
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
function checkRequired(fileContents: any): void {
  for (const key of REQUIRED_ON_REQUEST) {
    if (!fileContents[key]) {
      throw new Error(`Missing required key ${key}`);
    }
  }
}
