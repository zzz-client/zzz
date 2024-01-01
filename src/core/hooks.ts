import { dirname } from "https://deno.land/std/path/mod.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import Request from "./request.ts";

export default function Hooks(
  hooksName: string,
  requestFilePath: string,
  theRequest: Request,
): [Function, Function] {
  switch (hooksName.toLowerCase()) {
    case "js":
    case "javascript":
    default:
      return JavaScriptHooks(requestFilePath, theRequest);
    case "ts":
    case "typescript":
      return TypeScriptHooks(requestFilePath, theRequest);
    case "py":
    case "python":
      return PythonHooks(requestFilePath, theRequest);
  }
}
function noop(filePath: string): any {}
function notImplemented(): void {
  throw new Error("Not implemented");
}

function TypeScriptHooks(requestFilePath: string, _theRequest: Request): [Function, Function] {
  const beforePath = dirname(requestFilePath) + "/before.ts";
  const afterPath = dirname(requestFilePath) + "/after.ts";
  const result = { Before: noop, After: noop };
  if (existsSync(afterPath)) {
    result.After = notImplemented;
  }
  if (existsSync(beforePath)) {
    result.Before = notImplemented;
  }
  return [result.Before, result.After];
}
function JavaScriptHooks(requestFilePath: string, _theRequest: Request): [Function, Function] {
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
function PythonHooks(requestFilePath: string, _theRequest: Request): [Function, Function] {
  const beforePath = dirname(requestFilePath) + "/before.py";
  const afterPath = dirname(requestFilePath) + "/after.py";
  const result = { Before: noop, After: noop };
  if (existsSync(afterPath)) {
    result.After = (_data) => {
      eval(Deno.readTextFileSync(afterPath));
    };
    if (existsSync(beforePath)) {
      result.Before = () => eval(Deno.readTextFileSync(beforePath));
    }
  }
  return [result.Before, result.After];
}
