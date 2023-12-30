import { EntityType, Get } from "./store";
import Authorize from "./authorizer";
import Act from "./actor";
import tim from "./tim";
import Hooks from "./hooks";

const request = "Authentication/OAuth Client Credentials";
// const request = "BasicFunctionality";
// const request = "Mess/v1/Send Emails";
const environment = "Integrate";
const actorName = "Client";

async function main() {
    try {
        const letter = await Get(EntityType.Request, request, environment);
        await Authorize(letter, letter.Authorization);
        tim(letter, letter.Variables);
        // console.log(letter);
        const [beforeHook, afterHook] = Hooks(letter, request);
        beforeHook();
        const actResult = await Act(letter, actorName);
        afterHook(actResult);
        console.info(actResult);
    } catch (e) {
        console.error("ERRRROR", e);
        process.exit(1);
    }
}

main();
