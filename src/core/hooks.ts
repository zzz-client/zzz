import { dirname } from "https://deno.land/std/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import ZzzRequest from "./models.ts";

export default function Hooks(
  hooksName: string,
  requestFilePath: string,
  theRequest: ZzzRequest,
): [Function, Function] {
  if (!["js", "javascript"].includes(hooksName.toLowerCase())) {
    throw new Error('Only hooks supported presently is "javascript" (or "js"');
  }
  return JavaScriptHooks(requestFilePath, theRequest);
}
function noop(_filePath: string): any {}
function JavaScriptHooks(requestFilePath: string, _theRequest: ZzzRequest): [Function, Function] {
  const beforePath = dirname(requestFilePath) + "/before.js";
  const afterPath = dirname(requestFilePath) + "/after.js";
  const result = { Before: noop, After: noop };

  if (existsSync(afterPath)) {
    result.After = (_data) => eval(Deno.readTextFileSync(afterPath));
  }
  if (existsSync(beforePath)) {
    result.Before = () => eval(Deno.readTextFileSync(beforePath));
  }
  return [result.Before, result.After];
}
