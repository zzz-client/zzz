import Serve from "./src/serve.ts";
import { argv, exit } from "./src/libs.ts";
import Cli from "./src/cli.ts";

export const appConfigDefaults = {
  environment: "Integrate",
  actor: "Client",
  hooks: "YAML",
};

export default async function main() {
  try {
    const config = parseAppConfig();
    if (config.listen) {
      await Serve(config);
    } else {
      await Cli(config);
    }
  } catch (e) {
    console.error("!!!", e);
    exit(1);
  }
}
export function parseAppConfig(): AppConfig {
  const environment = getArgv(argv, "e", "environment", appConfigDefaults["environment"]);
  const actor = getArgv(argv, "a", "actor", appConfigDefaults["actor"]);
  const hooks = getArgv(argv, "h", "hooks", appConfigDefaults["hooks"]);
  return {
    environment,
    actor,
    request: (argv._.length === 0) ? "" : `${argv._[0]}`,
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
