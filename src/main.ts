import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";
import Application from "./apps/zzz/app.ts";
import Cli from "./apps/zzz/interfaces/cli.ts";
import { Server } from "./apps/zzz/interfaces/http.ts";
import { AuthorizationModule } from "./apps/zzz/modules/auth/mod.ts";
import { BodyModule } from "./apps/zzz/modules/body/mod.ts";
import { ContextModule } from "./apps/zzz/modules/context/mod.ts";
import { CookiesModule } from "./apps/zzz/modules/cookies/mod.ts";
import { PathParamsModule } from "./apps/zzz/modules/path-params/mod.ts";
import { RedactModule } from "./apps/zzz/modules/redact/mod.ts";
import { RequestsModule } from "./apps/zzz/modules/requests/mod.ts";
import { ScopeModule } from "./apps/zzz/modules/scope/mod.ts";
import TemplateModule from "./apps/zzz/modules/template/mod.ts";
import { Log, Trace as TraceOutput } from "./lib/lib.ts";

// deno-lint-ignore no-explicit-any
function Trace(arg: any) {
  TraceOutput(arg);
}

// import * as vite from "../node_modules/vite/bin/vite.js";

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
    app.registerModule(new CookiesModule(app));
    app.registerModule(new RedactModule(app));
    app.argv = processFlags(Deno.args, app.flags);
  } catch (error) {
    console.error("!!!", error);
    Deno.exit(1);
  }
  if (app.argv._.includes("run")) {
    Trace("Running CLI");
    return Cli(app);
  }
  if (
    app.argv.all ||
    app.argv.execute ||
    app.argv.format
  ) {
    if (app.argv.all) Trace("--all not allowed");
    if (app.argv.execute) Trace("--execute not allowed");
    if (app.argv.format) Trace("--format not allowed");
    throw new Error("Flags not allowed when starting HTTP or Web server");
  }
  if (app.argv._.includes("web")) {
    Log("Starting web server");
    Deno.args.splice(2);
    // vite;
    Deno.exit(0);
    // TODO
  }
  if (app.argv._.includes("http")) {
    Log("Starting HTTP server");
    return new Server(app).listen();
  }
  Log(":)");
  return Promise.resolve();
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
// deno-lint-ignore no-explicit-any
if ((import.meta as any).main) {
  main();
}
