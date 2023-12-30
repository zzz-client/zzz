import fs = require("node:fs");
import Store, { Load } from "./store";
import { dirname } from "path";
import Authorize from "./authorizer";
import Act from "./actor";
import Letter from "./letter";
import tim from "./tim";

// const request = "Authentication/OAuth Client Credentials";
// const request = "BasicFunctionality";
const request = "Mess/v1/Send Emails";
const environment = "Integrate";
const actor = "Client";

global.Store = Store;

async function main() {
    try {
        const letter = Load(request, environment);
        loadHooks(letter, request);
        await Authorize(letter, letter.Authorization);
        tim(letter, letter.Variables);
        // console.log(letter);
        const actResult = await Act(letter, actor);
        console.info("RESULT", actResult);
    } catch (e) {
        console.error("ERRRROR", e);
        process.exit(1);
    }
}

function loadHooks(letter: Letter, requestFilePath: string) {
    const beforePath = "requests/" + dirname(requestFilePath) + "/before.js";
    const afterPath = "requests/" + dirname(requestFilePath) + "/after.js";
    if (!letter.Trigger) {
        letter.Trigger = { Before: null, After: null };
    }
    if (fs.existsSync(afterPath)) {
        letter.Trigger.After = (result) => {
            const data = result; // This is expected by the eval statement
            return eval(fs.readFileSync(afterPath, "utf8"));
        };
    }
    if (fs.existsSync(beforePath)) {
        letter.Trigger.Before = () => eval(fs.readFileSync(beforePath, "utf8"));
    }
}

main();
