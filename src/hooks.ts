import { dirname, existsSync, readTextFileSync } from "./libs.ts";
import Request from "./request.ts";
import Store from "./store.ts";

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
  const beforePath = "requests/" + dirname(requestFilePath) + "/before.ts";
  const afterPath = "requests/" + dirname(requestFilePath) + "/after.ts";
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
  const beforePath = "requests/" + dirname(requestFilePath) + "/before.js";
  const afterPath = "requests/" + dirname(requestFilePath) + "/after.js";
  const result = { Before: noop, After: noop };
  if (existsSync(afterPath)) {
    result.After = (_data) => eval(readTextFileSync(afterPath));
  }
  if (existsSync(beforePath)) {
    result.Before = () => eval(readTextFileSync(beforePath));
  }
  return [result.Before, result.After];
}
function PythonHooks(requestFilePath: string, _theRequest: Request): [Function, Function] {
  const beforePath = "requests/" + dirname(requestFilePath) + "/before.py";
  const afterPath = "requests/" + dirname(requestFilePath) + "/after.py";
  const result = { Before: noop, After: noop };
  if (existsSync(afterPath)) {
    result.After = (_data) => {
      eval(readTextFileSync(afterPath));
    };
    if (existsSync(beforePath)) {
      result.Before = () => eval(readTextFileSync(beforePath));
    }
  }
  return [result.Before, result.After];
}
