import { Action, Log, Trace } from "../../../lib/lib.ts";
import { getFileFormat } from "../../../storage/files/formats.ts";
import { FeatureFlags } from "../../mod.ts";
import Application from "../app.ts";
import { HttpRequest } from "../modules/requests/mod.ts";

export default async function Cli(app: Application): Promise<void> {
  const flagValues = app.argv as FeatureFlags;
  Trace("Flag values:", flagValues);
  const action = new Action(flagValues, app.env);
  const model = new HttpRequest();
  try {
    await app.executeModules(action, model);
  } catch (error) {
    Log(error);
    Deno.exit(1);
  }
  Trace("result", model);
  console.info(getFileFormat(".json").stringify(model));
}
