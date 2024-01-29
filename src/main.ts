import IApplication from "./apps/mod.ts";
import * as Zzz from "./apps/zzz/app.ts";
import DI from "./lib/di.ts";
// import * as vite from "../node_modules/vite/bin/vite.js";

DI.register("IApplication", Zzz.newInstance);

export default async function main(): Promise<void> {
  try {
    const app = await DI.newInstance("IApplication") as IApplication;
    await app.run();
  } catch (error) {
    console.error("!!!", error);
    Deno.exit(1);
  }
  return Promise.resolve();
}

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
// deno-lint-ignore no-explicit-any
if ((import.meta as any).main) {
  main();
}
