import { argv } from "./libs.ts";
import { appConfigDefaults } from "./run.ts";

export default class Request {
  URL: string;
  Method: string;
  QueryParams: StringToStringMap;
  Headers: StringToStringMap;
  Variables: StringToStringMap;
  Body: any;
  constructor(url: string, method: string) {
    this.URL = url;
    this.Method = method;
    this.QueryParams = {} as StringToStringMap;
    this.Headers = {} as StringToStringMap;
    this.Variables = {} as StringToStringMap;
  }
}

export interface StringToStringMap {
  [key: string]: string;
}

export function parseAppConfig(): AppConfig {
  const environment = getArgv(argv, "e", "environment", appConfigDefaults["environment"]);
  const actor = getArgv(argv, "a", "actor", appConfigDefaults["actor"]);
  const hooks = getArgv(argv, "h", "hooks", appConfigDefaults["hooks"]);
  const request = (argv._.length === 0) ? "serve" : (argv._[0] + "");
  return {
    environment,
    actor,
    request,
    hooks,
  };
}
export type AppConfig = {
  environment: string;
  actor: string;
  request: string | "serve";
  hooks: string;
};

function getArgv(minimist: any, short: string, full: string, defaultVal: string): string {
  return minimist[short] || minimist[full] || defaultVal;
}
