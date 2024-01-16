import Application, { ApplicationConfig } from "../core/app.ts";
import AuthorizationModule from "../modules/authorization/index.ts";
import BodyModule from "../modules/body/index.ts";
import PathParamsModule from "../modules/path-params/index.ts";
import VariablesModule from "../modules/variables/index.ts";
import * as Tauri from "npm:tauri";

const app = new Application({
  store: "yml",
  actor: "Summary",
  modules: [AuthorizationModule, BodyModule],
});

export default async function Desktop(app: Application): Promise<void> {
}
