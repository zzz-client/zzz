import fs = require("node:fs");
import Letter from "./letter";
import Store from "./store";
import { dirname } from "path";

global.Store = Store; // Must be defined for eval

export default function Hooks(letter: Letter, requestFilePath: string): [Function, Function] {
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
function noop(filePath): any {}
