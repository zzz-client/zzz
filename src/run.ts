import Act from "./actor";
import Authorize from "./authorizer";
import Hooks from "./hooks";
import { parseAppConfig } from "./request";
import Serve from "./serve";
import { EntityType, Get } from "./store";
import tim from "./tim";
import * as YAML from "yaml";

// prettier-ignore
const testRequests = [
    "Authentication/OAuth Client Credentials",
    "BasicFunctionality",
    "Mess/v1/Send Emails"
];

export const appConfigDefaults = {
    environment: "Integrate",
    actor: "Client",
    hooks: "YAML"
};

export type Parser = { parse: (input: string) => any; stringify: (input: any) => string };
export const Parsers = {
    YML: YAML,
    YAML: YAML,
    JSON: {
        parse: JSON.parse,
        stringify: (input: any) => JSON.stringify(input, null, 2)
    },
    TEXT: {
        parse: (input: string) => input + "",
        stringify: (input: any) => input + ""
    }
};

async function main() {
    try {
        const config = parseAppConfig();
        // config.request = testRequests[0];
        if (config.request === "serve") {
            Serve(config);
            return;
        }
        const letter = await Get(EntityType.Request, config.request, config.environment);
        await Authorize(letter, letter.Authorization);
        tim(letter, letter.Variables);
        // console.log(letter);
        const [beforeHook, afterHook] = Hooks(config.hooks, config.request, letter);
        beforeHook();
        const actResult = await Act(letter, config.actor);
        afterHook(actResult);
        console.info(actResult);
    } catch (e) {
        console.error("!!!", e);
        process.exit(1);
    }
}

main();
