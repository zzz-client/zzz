import Serve from "./src/serve.ts";
import Act from "./src/actor.ts";
import Authorize from "./src/authorizer.ts";
import Hooks from "./src/hooks.ts";
import { EntityType, Get } from "./src/store.ts";
import tim from "./src/tim.ts";
import { argv, exit } from "./src/libs.ts";

export const appConfigDefaults = {
  environment: "Integrate",
  actor: "Client",
  hooks: "YAML",
};

export default async function main() {
  try {
    const config = parseAppConfig();
    if (config.listen) {
      return Serve(config);
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


export function parseAppConfig(): AppConfig {
  const environment = getArgv(argv, "e", "environment", appConfigDefaults["environment"]);
  const actor = getArgv(argv, "a", "actor", appConfigDefaults["actor"]);
  const hooks = getArgv(argv, "h", "hooks", appConfigDefaults["hooks"]);
  const request = (argv._.length === 0) ? "serve" : (argv._[0] + "");
  return {
    environment,
    actor,
    request,
    hooks,
    listen: argv.listen,
  };
}
export type AppConfig = {
  environment: string;
  actor: string;
  request: string | "serve";
  hooks: string;
  listen: boolean;
};

function getArgv(minimist: any, short: string, full: string, defaultVal: string): string {
  return minimist[short] || minimist[full] || defaultVal;
}


  // Learn more at https://deno.land/manual/examples/module_metadata#concepts
if ((import.meta as any).main) {
  main();
}
