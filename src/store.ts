import * as YAML from "yaml";
import Letter from "./letter";
import FileStore from "./stores/file";
import PostmanStore from "./stores/postman";
export enum EntityType {
    Default,
    Request = "requests",
    Environment = "environments",
    Authorization = "authorizations"
}
const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];

export default function Store(key: string, value: string): any {
    return newInstance().store(key, value);
}
export function Get(entityType: EntityType, entityName: string): any {
    return newInstance().get(entityType, entityName);
}
export function Load(requestFilePath: string, environmentName: string): any {
    const letter = new Letter();
    newInstance().load(letter, requestFilePath, environmentName);
    loadBody(letter, requestFilePath, environmentName);
    return letter;
}
export interface IStore {
    load(letter: Letter, requestFilePath: string, environmentName: string): void;
    get(entityType: EntityType, entityName: string): any;
    store(key: string, value: any): void;
}
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
function YamlStore(): IStore {
    return new FileStore("yml", YAML.parse, YAML.stringify);
}
function JsonStore(): IStore {
    return new FileStore("json", JSON.parse, (data: any) => JSON.stringify(data, null, 2));
}
function newInstance(): IStore {
    return YamlStore();
    // return new PostmanStore("PostmanCollection.json");
}
