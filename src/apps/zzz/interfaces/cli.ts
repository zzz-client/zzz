import { Action, Log, Trace } from "../../../lib/etc.ts";
import { getFileFormat } from "../../../storage/files/formats.ts";
import { Model } from "../../../storage/mod.ts";
import IApplication, { executeModules, FeatureFlags } from "../../mod.ts";
import ExecuteActor from "../actors/execute.ts";

export default async function Cli(app: IApplication): Promise<void> {
  const flagValues = app.argv as FeatureFlags;
  Trace("Flag values:", flagValues);
  const action = new Action(flagValues, app.env);
  const modelId = app.argv._[app.argv._.length - 1];
  Trace("modelId", modelId);
  const model = { Id: modelId } as Model;
  try {
    await executeModules(app.modules, action, model);
  } catch (error) {
    Log(error);
    Deno.exit(1);
  }
  Trace("Retrieved model", model);
  // TODO: Only execute for HttpRequest
  const finalResult = app.features.execute ? (await (new ExecuteActor()).act(model)) : model;
  console.info(getFileFormat(".json").stringify(finalResult));
}
