import Application, { ApplicationConfig } from "../app.ts";
import AuthorizationModule from "../../../modules/authorization/mod.ts";
import BodyModule from "../../../modules/body/mod.ts";
import PathParamsModule from "../../../modules/path-params/mod.ts";
import VariablesModule from "../modules/variables/module.ts";
import * as Tauri from "npm:tauri";

const app = new Application({
  store: "yml",
  actor: "Summary",
  modules: [AuthorizationModule, BodyModule],
});

export default async function Desktop(app: Application): Promise<void> {
}
