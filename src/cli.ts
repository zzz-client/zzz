import { ModelType } from "./core/storage.ts";
import { AppConfig } from "./main.ts";
import { Act, Authorize, newStore } from "./core/app.ts";
import Hooks from "./core/hooks.ts";
import { Get } from "./core/storage.ts";
import tim from "./core/tim.ts";
import { Parsers } from "./core/stores/file.ts";

export default async function Cli(config: AppConfig) {
  if (!config.arg) {
    // get workspaces?
    return;
  }
  const store = newStore("context???", config.context);

  const theRequest = await Get(
    ModelType.Entity,
    config.arg,
    config.context,
  );
  await Authorize(theRequest, theRequest.Authorization);
  tim(theRequest, theRequest.Variables);
  const [beforeHook, afterHook] = Hooks(
    config.hooks,
    config.arg,
    theRequest,
  );
  beforeHook();
  const actResult = await Act(theRequest, config.actor);
  afterHook(actResult);
  console.info(Parsers.JSON.stringify(actResult));
}
