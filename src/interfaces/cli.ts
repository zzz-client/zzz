import Application from "../core/app.ts";
import Action from "../core/action.ts";
import { HttpRequest } from "../modules/requests/mod.ts";
import { Model } from "../core/yeet.ts";
import { IModuleModifier } from "../core/module.ts";

export default async function Cli(app: Application): Promise<void> {
  const action = new Action(app.argv, app.env);
  const model = {} as Model;
  (model as any).Body = { foo: "bar" }; // DEBUG
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
