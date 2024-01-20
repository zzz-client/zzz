import Cli from "./interfaces/cli.ts";
import Application from "./apps/app.ts";
// import { Server } from "./interfaces/http.ts";
import { BodyModule } from "./modules/body/mod.ts";
import { RequestsModule } from "./modules/requests/mod.ts";
import { PathParamsModule } from "./modules/path-params/mod.ts";
import { AuthorizationModule } from "./modules/authorization/mod.ts";
import TemplateModule from "./modules/template/mod.ts";
import { ContextModule } from "./modules/context/mod.ts";
import { CookiesModule } from "./modules/cookies/mod.ts";
import { RedactModule } from "./modules/redact/mod.ts";
import { ScopeModule } from "./modules/scope/mod.ts";
import { processFlags } from "https://deno.land/x/flags_usage/mod.ts";

// function httpPromise(app: Application): Promise<void> {
//   if (Deno.args.includes("--http")) {
//     new Server(app).listen();
//   }
//   return Promise.resolve();
// }
// function webPromise(app: Application): Promise<void> {
//   if (Deno.args.includes("--web")) {
//     Promise.resolve(Deno.run({ cmd: ["deno", "task", "web"] }).status()); // TODO This will not work once it is a compiled program
//   }
//   return Promise.resolve();
// }
// function tuiPromise(app: Application): Promise<void> {
//   if (Deno.args.includes("--tui")) {
//     return Promise.reject("No TUI yet");
//   }
//   return Promise.resolve();
// }
// function cliPromise(app: Application) {
//   if ((!Deno.args.includes("--http") && !Deno.args.includes("--web") && !Deno.args.includes("--tui"))) {
//     return Cli(app);
//   }
//   return Promise.resolve();
// }

const app = new Application();
app.registerModule(new RequestsModule(app));
// app.registerModule(new AuthorizationModule(app));
app.registerModule(new BodyModule(app));
app.registerModule(new PathParamsModule(app));
app.registerModule(new ScopeModule(app));
app.registerModule(new TemplateModule(app));
app.registerModule(new ContextModule(app));
// app.registerModule(new CookiesModule(app));
// app.registerModule(new RedactModule(app));

app.argv = processFlags(Deno.args, app.flags);

Cli(app);

//export default async function main(): Promise<void> {
//   try {
//     const app = new Application({
//       store: "yml",
//       modules: [AuthorizationModule, BodyModule],
//     } as ApplicationConfig);
//     await Promise.all([
//       httpPromise(app),
//       webPromise(app),
//       tuiPromise(app),
//       cliPromise(app),
//     ]);
//   } catch (e) {
//     console.error("!!!", e);
//     Deno.exit(1);
//   }
// }
// // Learn more at https://deno.land/manual/examples/module_metadata#concepts
// if ((import.meta as any).main) {
//   main();
// }
