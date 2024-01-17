import { Args } from "https://deno.land/std/flags/mod.ts";
import tim from "../core/tim.ts";
import { getDriver } from "../stores/files/drivers.ts";
import Application from "../core/app.ts";
import AuthorizationModule from "../modules/authorization/index.ts";
import BodyModule from "../modules/body/index.ts";
import PathParamsModule from "../modules/path-params/index.ts";
import VariablesModule from "../modules/variables/index.ts";
import { ModelType } from "../core/models.ts";
import { load } from "https://deno.land/std/dotenv/mod.ts";

const app = new Application({
  store: "yml",
  actor: "Summary",
  modules: [AuthorizationModule, BodyModule],
});

export default async function Cli(app: Application): Promise<void> {
  const env = await load();
  const arg = app.argv._[0];
  const context = app.argv.context;
  let theEntity = await (await app.getStore()).get(ModelType.Entity, arg + "");
  app.applyModules(theEntity);
  const isVerbose = true;
  const isFormat = !!app.argv["format"];
  if (isFormat || isVerbose) {
    const variables = await VariablesModule.newInstance(app).load(theEntity, context);
    if (isFormat) {
      tim(theEntity, variables);
      theEntity = await PathParamsModule.newInstance(app).mod(theEntity, app.config);
    }
    if (isVerbose) {
      theEntity.Variables = variables;
    }
  }
  const actor = await app.getActor(app.argv.execute ? "Client" : "Pass");
  const actResult = await actor.act(theEntity);
  console.info(getDriver(".json").stringify(actResult));
}
