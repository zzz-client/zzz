import { EntityType } from "./store.ts";
import { AppConfig } from "../main.ts";
import Act from "./actor.ts";
import Authorize from "./authorizer.ts";
import Hooks from "./hooks.ts";
import { Get } from "./store.ts";
import tim from "./tim.ts";

export default async function Cli(config: AppConfig) {
  console.log("config", config);
  const theRequest = await Get(
    EntityType.Request,
    config.request,
    config.environment,
  );
  await Authorize(theRequest, theRequest.Authorization);
  tim(theRequest, theRequest.Variables);
  console.log("theRequest", theRequest);
  const [beforeHook, afterHook] = Hooks(
    config.hooks,
    config.request,
    theRequest,
  );
  beforeHook();
  const actResult = await Act(theRequest, config.actor);
  console.log("actResult", actResult);
  afterHook(actResult);
  console.info("after hook", actResult);
}
