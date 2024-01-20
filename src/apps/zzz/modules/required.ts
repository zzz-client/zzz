import { Model } from "../core/yeet.ts";
import { IModuleModifier, Module } from "./module.ts";

export default class RequiredModule implements Module, IModuleModifier {
  dependencies = [];
  modify(theRequest: Model): Promise<void> {
    if (theRequest.Type == "Request") {
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
