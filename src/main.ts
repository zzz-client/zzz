import Cli from "./apps/zzz/interfaces/cli.ts";
import Application from "./apps/zzz/app.ts";
// import { Server } from "./interfaces/http.ts";
import { BodyModule } from "./apps/zzz/modules/body/mod.ts";
import { RequestsModule } from "./apps/zzz/modules/requests/mod.ts";
import { PathParamsModule } from "./apps/zzz/modules/path-params/mod.ts";
import { AuthenticationModule } from "./apps/zzz/modules/auth/mod.ts";
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
    // app.registerModule(new AuthenticationModule(app));
    app.registerModule(new BodyModule(app));
    app.registerModule(new PathParamsModule(app));
    app.registerModule(new ScopeModule(app));
    app.registerModule(new TemplateModule(app));
    app.registerModule(new ContextModule(app));
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

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
// deno-lint-ignore no-explicit-any
if ((import.meta as any).main) {
  main();
}
