import Serve from "./http.ts";
import Cli from "./cli.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";
import { Args } from "https://deno.land/std/flags/mod.ts";

export const DEFAULT_HTTP_PORT = 8000;
export const DEFAULT_WEB_PORT = 5173;

const options = {
  preamble: "Usage: zzz <options>", // Optional preamble for describing non-flag/positional arguments
  description: {
    environment: "Environment to execute in",
    workspace: "Workspace to execute in",
    http: "Start HTTP server",
    web: "Start web UI server",
  },
  argument: {
    environment: "environment",
    workspace: "workspace",
    http: "port",
    web: "port",
  },
  alias: {
    environment: "e",
    workspace: "w",
  },
  string: ["environment", "workspace", "http", "web"],
  default: {
    http: DEFAULT_HTTP_PORT,
    web: 5173,
  },
};

export const argv = processFlags(Deno.args, options);

export default async function main(): Promise<void> {
  try {
    const config = parseAppConfig(argv);
    await Promise.all([
      Deno.args.includes("--http") ? Serve(config) : null,
      Deno.args.includes("--web") ? Deno.run({ cmd: ["deno", "task", "web"] }).status() : null,
      Deno.args.includes("--tui")
        ? (() => {
          throw new Error("No TUI yet");
        })()
        : null,
      (!Deno.args.includes("--http") && !Deno.args.includes("--web") && !Deno.args.includes("--tui")) ? Cli(config) : null,
    ]);
  } catch (e) {
    console.error("!!!", e);
    Deno.exit(1);
  }
}
export function parseAppConfig(argv: Args): AppConfig {
  return {
    environment: argv.environment,
    request: (argv._.length === 0) ? "" : `${argv._[0]}`,
  };
}
export type AppConfig = {
  environment: string;
  request: string;
};

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if ((import.meta as any).main) {
  main();
}
