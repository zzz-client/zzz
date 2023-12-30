import fs = require("node:fs");
import { dirname } from "path";
import * as YAML from "yaml";
import Letter from "./letter";
import FileStore from "./stores/file";
export enum EntityType {
    Default,
    Request = "requests",
    Environment = "environments",
    Authorization = "authorizations"
}
export default function Store(key: string, value: string): any {
    return newInstance().store(key, value);
}
export function Get(entityType: EntityType, entityName: string): any {
    return newInstance().get(entityType, entityName);
}
export function Load(requestFilePath: string, environmentName: string): any {
    const letter = new Letter();
    newInstance().load(letter, requestFilePath, environmentName);
    loadHooks(letter, requestFilePath);
    loadBody(letter, requestFilePath, environmentName);
    return letter;
}
export interface IStore {
    load(letter: Letter, requestFilePath: string, environmentName: string): void;
    get(entityType: EntityType, entityName: string): any;
    store(key: string, value: any): void;
}

const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
export function checkRequired(fileContents: any): void {
    for (const key of REQUIRED_ON_REQUEST) {
        if (!fileContents[key]) {
            throw `Missing required key ${key}`;
        }
    }
}
export function checkForbidden(fileContents: any): void {
    for (const key of NO_DEFAULT_ALLOWED) {
        if (fileContents[key]) {
            throw `Forbidden key ${key}`;
        }
    }
}

function loadBody(letter: Letter, requestFilePath: string, environmentName: string) {
    if (typeof letter.Body === "string") {
        letter.Body = JSON.parse(letter.Body);
        return;
    }
}
// TODO: This should not be done by the Store. I think this should be done inside index.ts immediately after Load is called. Though actually this has more to do with the actor...
function loadHooks(letter: Letter, requestFilePath: string) {
    const beforePath = dirname(requestFilePath) + "/before.js";
    const afterPath = dirname(requestFilePath) + "/after.js";
    if (fs.existsSync(afterPath)) {
        letter.Trigger.After = (response) => eval(fs.readFileSync(afterPath, "utf8"));
    }
    if (fs.existsSync(beforePath)) {
        letter.Trigger.Before = () => eval(fs.readFileSync(beforePath, "utf8"));
    }
}
function newInstance(): IStore {
    return YamlStore();
    // return JsonStore();
}
function YamlStore(): IStore {
    return new FileStore("yml", YAML.parse, YAML.stringify);
}
function JsonStore(): IStore {
    return new FileStore("json", JSON.parse, (data: any) => JSON.stringify(data, null, 2));
}
