import Application, { FeatureFlags } from "../app.ts";
import { Action } from "../../../lib/lib.ts";
import { IModuleModifier } from "../../../lib/module.ts";
import { Model } from "../../../stores/files/store.ts";
import { HttpRequest } from "../modules/requests/mod.ts";

export default async function Cli(app: Application): Promise<void> {
  const flagValues = app.argv as FeatureFlags;
  // const action = new HttpRequest(flagValues, app.env);
  const action = new Action({}, {});
  const model = { Id: "Salesforce Primary/BasicFunctionality" } as Model;
  // (model as any).Body = { foo: "bar" }; // DEBUG
  for (const module of app.modules) {
    if ("modify" in module) {
      (module as unknown as IModuleModifier).modify(model, action);
    }
  }
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
