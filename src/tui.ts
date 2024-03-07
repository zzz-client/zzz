// deno-lint-ignore-file no-explicit-any
import { initDi } from "./apps/zzz/app.ts";
import Application from "./apps/zzz/interfaces/tui/app.ts";

if ((import.meta as any).main) {
  initDi();
  await new Application().run();
}
