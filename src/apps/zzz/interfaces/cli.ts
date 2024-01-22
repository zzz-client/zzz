import { Action } from "../../../lib/lib.ts";
import { FeatureFlags } from "../../mod.ts";
import Application from "../app.ts";
import { HttpRequest } from "../modules/requests/mod.ts";

export default async function Cli(app: Application): Promise<void> {
  const flagValues = app.argv as FeatureFlags;
  console.log("flagValues", flagValues);
  const action = new Action(flagValues, app.env);
  console.log("Action features", action.features);
  const model = new HttpRequest();
  model.Id = "Salesforce Primary/BasicFunctionality";
  await app.executeModules(action, model);
  // (model as any).Body = { foo: "bar" }; // DEBUG
  console.log("result", model);
  // const context = app.argv.context;
  // let theEntity = await (await app.getStore()).get(ModelType.Entity, arg + "");
  // const isVerbose = true;
  // const isFormat = !!app.argv["format"];
  // if (isFormat || isVerbose) {
  //   const variables = await VariablesModule.newInstance(app).load(theEntity, context);
  //   if (isFormat) {
  //     tim(theEntity, variables);
  //     theEntity = await PathParamsModule.newInstance(app).mod(theEntity, app.config);
  //   }
  //   if (isVerbose) {
  //     theEntity.Variables = variables;
  //   }
  // }
  // const actor = await app.getActor(app.argv.execute ? "Client" : "Pass");
  // const actResult = await actor.act(theEntity);
  // console.info(getFileFormat(".json").stringify(actResult));
}
