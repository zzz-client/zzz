import { Args } from "https://deno.land/std/flags/mod.ts";
import tim from "../core/tim.ts";
import { getDriver } from "../stores/files/drivers.ts";
import Application, { ApplicationConfig } from "../core/app.ts";
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
  let theEntity = await (await app.getStore()).get(ModelType.Entity, arg + "", context);
  app.applyModules(theEntity);
  const isVerbose = false;
  const isFormat = true;
  if(isFormat){
    const variables = await VariablesModule.newInstance(app).load(theEntity, context);
    tim(theEntity, variables);
    theEntity = await PathParamsModule.newInstance(app).mod(theEntity);
  }
  const actor = await app.getActor("Pass");
  const actResult = await actor.act(theEntity);
  console.info(getDriver(".json").stringify(actResult));
}
