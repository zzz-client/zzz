import { Args } from "https://deno.land/std/flags/mod.ts";
import tim from "../core/tim.ts";
import { getDriver } from "../stores/files/drivers.ts";
import Application, { ApplicationConfig } from "../core/app.ts";
import AuthorizationModule from "../modules/authorization/index.ts";
import BodyModule from "../modules/body/index.ts";
import { ModelType } from "../core/models.ts";

const app = new Application({
  store: "yml",
  actor: "Summary",
  modules: [AuthorizationModule, BodyModule],
});

export default async function Cli(app: Application): Promise<void> {
  const arg = app.argv._[0];
  const theEntity = await (await app.getStore()).get(ModelType.Entity, arg + "", "");
  console.log("theEntity", theEntity);
  // const theRequest = await Get(
  //   ModelType.Entity,
  //   config.arg,
  //   config.context,
  // );
  // await Authorize(theRequest, theRequest.Authorization);
  // tim(theRequest, theRequest.Variables);
  // const [beforeHook, afterHook] = Hooks(
  //   config.hooks,
  //   config.arg,
  //   theRequest,
  // );
  // beforeHook();
  // const actResult = await Act(theRequest, config.actor);
  // afterHook(actResult);
  // console.info(getDriver(".json").stringify(actResult));
}
