// deno-lint-ignore-file
import * as Tauri from "npm:tauri";

const app = new Application({
  store: "yml",
  actor: "Summary",
  modules: [AuthorizationModule, BodyModule],
});

export default async function Desktop(app: IApplication): Promise<void> {
}
