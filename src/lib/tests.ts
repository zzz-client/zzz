// deno-lint-ignore-file

import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import DI from "../lib/di.ts";
import { newInstance } from "../apps/zzz/interfaces/cli/app.ts";

export { assertEquals };

// class Application implements IApplication {
// }

export function mockApp() {
  DI.register("IApplication", newInstance);
}
