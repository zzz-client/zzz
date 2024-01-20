// import Cli from "./interfaces/cli.ts";
// import Application, { ApplicationConfig } from "./core/app.ts";
// import AuthorizationModule from "./modules/authorization/module.ts";
// import BodyModule from "./modules/body/module.ts";
// import PathParamsModule from "./modules/path-params/module.ts";
// import { Server } from "./interfaces/http.ts";

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

// export default async function main(): Promise<void> {
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
