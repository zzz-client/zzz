import Serve from "./http.ts";
import Cli from "./cli.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";
import { Args } from "https://deno.land/std/flags/mod.ts";
import Application from "./core/app.ts";
import AuthorizationModule from "./modules/authorization.ts";
import BodyModule from "./modules/body.ts";
import Flags from "./core/flags.ts";

const app = new Application({
  store: "FileStore",
  actor: "Client",
  modules: [AuthorizationModule, BodyModule],
});

export default async function main(): Promise<void> {
  try {
    const argv = processFlags(Deno.args, Flags);

    await Promise.all([
      Deno.args.includes("--http") ? Serve(argv) : null,
      Deno.args.includes("--web") ? Deno.run({ cmd: ["deno", "task", "web"] }).status() : null,
      Deno.args.includes("--tui")
        ? (() => {
          throw new Error("No TUI yet");
        })()
        : null,
      (!Deno.args.includes("--http") && !Deno.args.includes("--web") && !Deno.args.includes("--tui")) ? Cli(argv) : null,
    ]);
  } catch (e) {
    console.error("!!!", e);
    Deno.exit(1);
  }
}
// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if ((import.meta as any).main) {
  main();
}
