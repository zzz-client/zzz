import * as Minimist from "minimist";
import { appConfigDefaults } from "./run";

export default class Request {
    URL: string;
    Method: string;
    QueryParams: StringToStringMap = {};
    Headers: StringToStringMap = {};
    Variables: StringToStringMap | undefined;
    Body: any;
}

export interface StringToStringMap {
    [key: string]: string;
}
export type AnyNonPromise<T> = (T & { then?: void }) | Request;

export function parseAppConfig(): AppConfig {
    const argv = Minimist(process.argv.slice(2));
    const environment = getArgv(argv, "e", "environment", appConfigDefaults["environment"]);
    const actor = getArgv(argv, "a", "actor", appConfigDefaults["actor"]);
    const hooks = getArgv(argv, "h", "hooks", appConfigDefaults["hooks"]);
    const request = argv._.length === 0 ? "serve" : argv._[0];
    return {
        environment,
        actor,
        request,
        hooks
    };
}
export type AppConfig = {
    environment: string;
    actor: string;
    request: string | "serve";
    hooks: string;
};

function getArgv<T>(minimist: AnyNonPromise<T>, short: string, full: string, defaultVal: string): string {
    return minimist[short] || minimist[full] || defaultVal;
}
