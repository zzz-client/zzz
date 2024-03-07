import { Action, asAny, Log } from "../core/etc.ts";
import { getFileFormat } from "../core/storage/files/formats.ts";
import { Model } from "../core/storage/mod.ts";
import IApplication, { executeModules, FeatureFlags } from "../apps/mod.ts";
import ExecuteActor from "../core/actors/execute.ts";
import { initDi } from "../apps/zzz/app.ts";
import Application from "./app.ts";

export default async function Cli(app: IApplication): Promise<void> {
  const flagValues = app.argv as FeatureFlags;
  const action = new Action(flagValues, app.env);
  const modelId = app.argv._[app.argv._.length - 1] as string;
  // const modelType = await app.store.getModelType(modelId);
  const model = new Model(); // TODO Construct properly using modelType
  model.Id = modelId;
  try {
    await executeModules(app.modules, action, model);
  } catch (error) {
    Log(error);
    Deno.exit(1);
  }
  // console.log("Retrieved model", model);
  let finalResult = model;
  const actor = new ExecuteActor();
  if (action.features.execute) {
    // TODO: Only execute for HttpRequest
    finalResult = await actor.act(model);
  }
  console.info(getFileFormat(".json").stringify(finalResult));
}

// TODO: Tests

if (asAny(import.meta).main) {
  initDi();
  await new Application().run();
}
