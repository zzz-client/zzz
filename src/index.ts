import fs = require("node:fs");
import Store, { Load } from "./store";
import { dirname } from "path";
import Authorize from "./authorizer";
import Act from "./actor";
import Do from "./tim";
import Letter from "./letter";

// const request = "requests/mess/v1/send/Send Emails.yml";
const request = "requests/Authentication/OAuth/ClientCredentials.yml";
// const request = "requests/BasicFunctionality.yml";
// const request = "requests/Authentication/OAuth/ClientCredentials.json";
const environment = "Integrate";
const actor = "Client";

global.Store = Store;

async function main() {
    try {
        const letter = Load(request, environment);
        loadHooks(letter, request);
        await Authorize(letter, letter.Authorization);
        Do(letter, letter.Variables);
        const actResult = await Act(letter, actor);
        console.info(actResult);
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
