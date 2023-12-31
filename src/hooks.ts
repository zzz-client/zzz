import fs = require("node:fs");
import { dirname } from "path";
import Request from "./request";
import Store from "./store";

global.Store = Store; // Must be defined for eval

export default function Hooks(hooksName: string, requestFilePath: string, theRequest: Request): [Function, Function] {
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
function noop(filePath): any {}
function notImplemented(): void {
    throw new Error("Not implemented");
}

function TypeScriptHooks(requestFilePath: string, theRequest: Request): [Function, Function] {
    const beforePath = "requests/" + dirname(requestFilePath) + "/before.ts";
    const afterPath = "requests/" + dirname(requestFilePath) + "/after.ts";
    const result = { Before: noop, After: noop };
    if (fs.existsSync(afterPath)) {
        result.After = notImplemented;
    }
    if (fs.existsSync(beforePath)) {
        result.Before = notImplemented;
    }
    return [result.Before, result.After];
}
function JavaScriptHooks(requestFilePath: string, theRequest: Request): [Function, Function] {
    const beforePath = "requests/" + dirname(requestFilePath) + "/before.js";
    const afterPath = "requests/" + dirname(requestFilePath) + "/after.js";
    const result = { Before: noop, After: noop };
    if (fs.existsSync(afterPath)) {
        result.After = (data) => eval(fs.readFileSync(afterPath, "utf8"));
    }
    if (fs.existsSync(beforePath)) {
        result.Before = () => eval(fs.readFileSync(beforePath, "utf8"));
    }
    return [result.Before, result.After];
}
function PythonHooks(requestFilePath: string, theRequest: Request): [Function, Function] {
    const beforePath = "requests/" + dirname(requestFilePath) + "/before.py";
    const afterPath = "requests/" + dirname(requestFilePath) + "/after.py";
    const result = { Before: noop, After: noop };
    if (fs.existsSync(afterPath)) {
        result.After = (data) => {
            eval(fs.readFileSync(afterPath, "utf8"));
        };
        if (fs.existsSync(beforePath)) {
            result.Before = () => eval(fs.readFileSync(beforePath, "utf8"));
        }
        return [result.Before, result.After];
    }
}
