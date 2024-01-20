import { load } from "https://deno.land/std/dotenv/mod.ts";
import Application from "../core/app.ts";
import tim from "../modules/template/tim.ts";
import { AuthorizationModule } from "../modules/authorization/module.ts";
import { BodyModule } from "../modules/body/module.ts";
import { PathParamsModule } from "../modules/path-params/module.ts";
import { ContextModule } from "../modules/context/module.ts";
import { getFileFormat } from "../stores/files/formats.ts";

export default async function Cli(app: Application): Promise<void> {
  const env = await load();
  const arg = app.argv._[0];
  const context = app.argv.context;
  let theEntity = await (await app.getStore()).get(ModelType.Entity, arg + "");
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
  console.info(getFileFormat(".json").stringify(actResult));
}
