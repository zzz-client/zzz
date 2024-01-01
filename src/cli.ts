import { EntityType } from "./core/storage.ts";
import { AppConfig } from "./main.ts";
import { Act, Authorize } from "./core/factories.ts";
import Hooks from "./core/hooks.ts";
import { Get } from "./core/storage.ts";
import tim from "./core/tim.ts";
import { Parsers } from "./core/render.ts";

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
