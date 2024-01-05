import { EntityType } from "./core/storage.ts";
import { AppConfig } from "./main.ts";
import { Act, Authorize, newStore } from "./core/app.ts";
import Hooks from "./core/hooks.ts";
import { Get } from "./core/storage.ts";
import tim from "./core/tim.ts";
import { Parsers } from "./core/stores/file.ts";

export default async function Cli(config: AppConfig) {
  if (!config.request) {
    // get workspaces?
    return;
  }
  const store = newStore("context???", config.environment);

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
