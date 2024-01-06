import Cli from "./cli.ts";
import Application from "./core/app.ts";
import AuthorizationModule from "./modules/authorization.ts";
import BodyModule from "./modules/body.ts";
import { Server } from "./http.ts";

function httpPromise(app: Application): Promise<void> {
  if (Deno.args.includes("--http")) {
    new Server(app).listen("Client");
  }
  return Promise.resolve();
}
function webPromise(app: Application): Promise<void> {
  if (Deno.args.includes("--web")) {
    Promise.resolve(Deno.run({ cmd: ["deno", "task", "web"] }).status());
  }
  return Promise.resolve();
}
function tuiPromise(app: Application): Promise<void> {
  if (Deno.args.includes("--tui")) {
    return Promise.reject("No TUI yet");
  }
  return Promise.resolve();
}
function cliPromise(app: Application) {
  if ((!Deno.args.includes("--http") && !Deno.args.includes("--web") && !Deno.args.includes("--tui"))) {
    return Cli(app);
  }
  return Promise.resolve();
}

export default async function main(): Promise<void> {
  try {
    const app = new Application({
      store: "FileStore",
      actor: "Client",
      modules: [AuthorizationModule, BodyModule],
    });
    await Promise.all([
      httpPromise(app),
      webPromise(app),
      tuiPromise(app),
      cliPromise(app),
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
