import { Action, Log, Trace } from "../../../lib/etc.ts";
import { getFileFormat } from "../../../storage/files/formats.ts";
import { Model } from "../../../storage/mod.ts";
import IApplication, { executeModules, FeatureFlags } from "../../mod.ts";
import ExecuteActor from "../actors/execute.ts";
import { HttpRequest } from "../modules/requests/mod.ts";

export default async function Cli(app: IApplication): Promise<void> {
  const flagValues = app.argv as FeatureFlags;
  const action = new Action(flagValues, app.env);
  const modelId = app.argv._[app.argv._.length - 1];
  const model = new Model();
  model.Id = modelId + "";
  try {
    await executeModules(app.modules, action, model);
  } catch (error) {
    Log(error);
    Deno.exit(1);
  }
  console.log("Retrieved model", model);
  // TODO: Only execute for HttpRequest
  let finalResult = model;
  const actor = new ExecuteActor();
  if (action.features.execute) {
    console.log(model);
    // if (!(model instanceof HttpRequest)) {
    //   console.error("Can only execute requests");
    //   Deno.exit(1);
    // }
    finalResult = await actor.act(model);
  }
  console.info(getFileFormat(".json").stringify(finalResult));
}
