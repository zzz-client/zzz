import Cli from "./apps/zzz/interfaces/cli.ts";
import Application from "./apps/zzz/app.ts";
// import { Server } from "./interfaces/http.ts";
import { BodyModule } from "./apps/zzz/modules/body/mod.ts";
import { RequestsModule } from "./apps/zzz/modules/requests/mod.ts";
import { PathParamsModule } from "./apps/zzz/modules/path-params/mod.ts";
import { AuthorizationModule } from "./apps/zzz/modules/auth/mod.ts";
import TemplateModule from "./apps/zzz/modules/template/mod.ts";
import { ContextModule } from "./apps/zzz/modules/context/mod.ts";
import { CookiesModule } from "./apps/zzz/modules/cookies/mod.ts";
import { RedactModule } from "./apps/zzz/modules/redact/mod.ts";
import { ScopeModule } from "./apps/zzz/modules/scope/mod.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";

export default function main(): Promise<void> {
  const app = new Application();
  try {
    app.registerModule(new RequestsModule(app));
    app.registerModule(new BodyModule(app));
    app.registerModule(new PathParamsModule(app));
    app.registerModule(new ScopeModule(app));
    app.registerModule(new ContextModule(app));
    app.registerModule(new AuthorizationModule(app));
    app.registerModule(new TemplateModule(app));
    // app.registerModule(new CookiesModule(app));
    // app.registerModule(new RedactModule(app));
    app.argv = processFlags(Deno.args, app.flags);
    //     await Promise.all([
    //       httpPromise(app),
    //       webPromise(app),
    //       tuiPromise(app),
    //       cliPromise(app),
    //     ]);
  } catch (error) {
    console.error("!!!", error);
    Deno.exit(1);
  }
  return Cli(app);
}

function httpPromise(app: Application): Promise<void> {
  if (Deno.args.includes("--http")) {
    // new Server(app).listen();
  }
  return Promise.resolve();
}
function webPromise(app: Application): Promise<void> {
  if (Deno.args.includes("--web")) {
    Promise.resolve(Deno.run({ cmd: ["deno", "task", "web"] }).status()); // TODO This will not work once it is a compiled program
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

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if ((import.meta as any).main) {
  main();
}
