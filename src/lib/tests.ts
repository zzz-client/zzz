// deno-lint-ignore-file

import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import Application from "../apps/zzz/app.ts";
console.log = () => {};

function testApp() {
  return new Application();
}

export { assertEquals, testApp };
