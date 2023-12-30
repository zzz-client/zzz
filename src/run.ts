const http = require("http");
const HTTP_PORT = process.env.PORT || 8000;
import { EntityType, Get } from "./store";
import Authorize from "./authorizer";
import Act from "./actor";
import tim from "./tim";
import Hooks from "./hooks";
import * as Minimist from "minimist";
import { AnyNonPromise } from "./letter";

function parseAppConfig(): AppConfig {
    const argv = Minimist(process.argv.slice(2));
    const environment = getArgv(argv, "e", "environment", "Integrate");
    const actor = getArgv(argv, "a", "actor", "Client");
    const hooks = getArgv(argv, "h", "hooks", "YAML");
    const request = argv._.length === 0 ? "serve" : argv._[0];
    return {
        environment,
        actor,
        request,
        hooks
    };
}
type AppConfig = {
    environment: string;
    actor: string;
    request: string | "serve";
    hooks: string;
};

// prettier-ignore
const testRequests = [
    "Authentication/OAuth Client Credentials",
    "BasicFunctionality",
    "Mess/v1/Send Emails"
], testRequest = testRequests[ 0 ];

async function main() {
    try {
        const config = parseAppConfig();
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

function getArgv<T>(minimist: AnyNonPromise<T>, short: string, full: string, defaultVal: string): string {
    return minimist[short] || minimist[full] || defaultVal;
}

function Serve(appConfig: AppConfig) {
    http.createServer((req, res) => {
        const { method, url, headers } = req;
        if (url === "/favicon.ico") {
            res.end();
            return;
        }
        const resourcePath = decodeURI(url.substring(1));
        console.log("First request", method, resourcePath);
        Get(EntityType.Request, resourcePath, "Integrate")
            .then((letter) => {
                tim(letter, letter.Variables);
                return Act(letter, appConfig.actor);
            })
            .then((result) => {
                res.writeHead(200, { "Content-Type": "text/plain" }); // TODO: How to have this set from Actor? Maybe add to IActor interface?
                res.write(result);
                // res.writeHead(200, { "Content-Type": "application/json" });
                // res.write(JSON.stringify(what, null, 4));
                res.end();
            });
    }).listen(HTTP_PORT, () => {
        console.log(`App is running on port ${HTTP_PORT}`);
    });
}

main();
