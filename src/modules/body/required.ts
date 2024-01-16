import { Model } from "../../core/models.ts";
import { IModule, ModuleConfig } from "../manager.ts";

export default class BodyModule implements IModule {
  mod(theRequest: Model, config: ModuleConfig): Promise<void> {
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
