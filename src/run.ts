import Act from "./actor.ts";
import Authorize from "./authorizer.ts";
import Hooks from "./hooks.ts";
import { parseAppConfig } from "./request.ts";
import Serve from "./serve.ts";
import { EntityType, Get } from "./store.ts";
import tim from "./tim.ts";
import { exit } from "./libs.ts";

export const appConfigDefaults = {
  environment: "Integrate",
  actor: "Client",
  hooks: "YAML",
};

export default async function main() {
  try {
    const config = parseAppConfig();
    // config.request = testRequests[0];
    if (config.request === "serve") {
      Serve(config);
      return;
    }
    const theRequest = await Get(
      EntityType.Request,
      config.request,
      config.environment,
    );
    await Authorize(theRequest, theRequest.Authorization);
    tim(theRequest, theRequest.Variables);
    // console.log(theRequest);
    const [beforeHook, afterHook] = Hooks(
      config.hooks,
      config.request,
      theRequest,
    );
    beforeHook();
    const actResult = await Act(theRequest, config.actor);
    afterHook(actResult);
    console.info(actResult);
  } catch (e) {
    console.error("!!!", e);
    exit(1);
  }
}
