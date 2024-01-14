import { dirname } from "https://deno.land/std/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Entity } from "./models.ts";

export default function Hooks(
  hooksName: string,
  entityFilePath: string,
  theEntity: Entity,
): [Function, Function] {
  if (!["js", "javascript"].includes(hooksName.toLowerCase())) {
    throw new Error('Only hooks supported presently is "javascript" (or "js"');
  }
  return JavaScriptHooks(entityFilePath, theEntity);
}
function noop(_filePath: string): any {}
function JavaScriptHooks(entityFilePath: string, _theRequest: Entity): [Function, Function] {
  const beforePath = dirname(entityFilePath) + "/before.js";
  const afterPath = dirname(entityFilePath) + "/after.js";
  const result = { Before: noop, After: noop };

  if (existsSync(afterPath)) {
    result.After = (_data) => eval(Deno.readTextFileSync(afterPath));
  }
  if (existsSync(beforePath)) {
    result.Before = () => eval(Deno.readTextFileSync(beforePath));
  }
  return [result.Before, result.After];
}
