import fs = require("node:fs");
import Store, { Load } from "./store";
import { dirname } from "path";
import Authorize from "./authorizer";
import Act from "./actor";
import Letter from "./letter";
import tim from "./tim";

// const request = "mess/v1/sendEmails";
// const request = "BasicFunctionality";
const request = "Authentication/OAuth Client Credentials";
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
        console.error(e);
        process.exit(1);
    }
}

function loadHooks(letter: Letter, requestFilePath: string) {
    const beforePath = dirname(requestFilePath) + "/before.js";
    const afterPath = dirname(requestFilePath) + "/after.js";
    if (fs.existsSync(afterPath)) {
        letter.Trigger.After = (data) => {
            return eval(fs.readFileSync(afterPath, "utf8"));
        };
    }
    if (fs.existsSync(beforePath)) {
        letter.Trigger.Before = () => eval(fs.readFileSync(beforePath, "utf8"));
    }
}

main();
