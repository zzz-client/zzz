import { EntityType } from "./store.ts";
import { AppConfig } from "../main.ts";
import Act from "./actor.ts";
import Authorize from "./authorizer.ts";
import Hooks from "./hooks.ts";
import { Get } from "./store.ts";
import tim from "./tim.ts";
import { Parsers } from "./format.ts";

export default async function Cli(config: AppConfig) {
  const theRequest = await Get(
    EntityType.Request,
    config.request,
    config.environment,
  );
  await Authorize(theRequest, theRequest.Authorization);
  tim(theRequest, theRequest.Variables);
  const [beforeHook, afterHook] = Hooks(
    config.hooks,
    config.request,
    theRequest,
  );
  beforeHook();
  const actResult = await Act(theRequest, config.actor);
  afterHook(actResult);
  console.info(Parsers.JSON.stringify(actResult));
}
