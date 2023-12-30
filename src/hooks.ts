import fs = require("node:fs");
import Letter from "./letter";
import { dirname } from "path";

export function loadHooks(letter: Letter, requestFilePath: string): [Function, Function] {
    const beforePath = "requests/" + dirname(requestFilePath) + "/before.js";
    const afterPath = "requests/" + dirname(requestFilePath) + "/after.js";
    const result = { Before: null, After: null };
    if (fs.existsSync(afterPath)) {
        result.After = evalMe;
    }
    if (fs.existsSync(beforePath)) {
        result.Before = evalMe;
    }
    console.log(result);
    return [result.Before, result.After];
}
function evalMe(filePath): any {
    eval(fs.readFileSync(filePath, "utf8"));
}
