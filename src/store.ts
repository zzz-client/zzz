import fs = require("node:fs");
import { dirname } from "path";
import * as YAML from "yaml";
import Letter from "./letter";
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
interface IStore {
    load(letter: Letter, requestFilePath: string, environmentName: string): void;
    get(entityType: EntityType, entityName: string): any;
    store(key: string, value: any): void;
}

const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];

function loadBody(letter: Letter, requestFilePath: string, environmentName: string) {
    if (typeof letter.Body === "string") {
        letter.Body = JSON.parse(letter.Body);
        return;
    }
}
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
class FileStore implements IStore {
    fileExtension: string;
    parse: Function;
    stringify: Function;
    constructor(fileExtension: string, parseMethod: Function, stringifyMethod: Function) {
        this.fileExtension = fileExtension;
        this.parse = parseMethod;
        this.stringify = stringifyMethod;
    }
    load(letter: Letter, requestFilePath: string, environmentName: string): void {
        const defaultFilePaths = getDefaultFilePaths(requestFilePath, this.fileExtension, environmentName);
        for (const filePath of defaultFilePaths) {
            if (fs.existsSync(filePath)) {
                const fileContents = this.parse(fs.readFileSync(filePath, "utf8"));
                checkForbidden(fileContents);
                applyChanges(letter, fileContents);
            }
        }
        const fileContents = this.parse(fs.readFileSync(requestFilePath, "utf8"));
        checkRequired(fileContents);
        applyChanges(letter, fileContents);
        const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
        if (fs.existsSync(sessionPath)) {
            const sessionContents = this.parse(fs.readFileSync(sessionPath, "utf8"));
            applyChanges(letter, sessionContents);
        }
    }
    get(entityType: EntityType, entityName: string): any {
        const filePath = `${entityType}/${entityName}.${this.fileExtension}`;
        return this.parse(fs.readFileSync(filePath, "utf8"));
    }
    store(key: string, value: any): void {
        const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
        let sessionContents: any;
        if (fs.existsSync(sessionPath)) {
            sessionContents = this.parse(fs.readFileSync(sessionPath, "utf8"));
        } else {
            sessionContents = { Variables: {} };
        }
        sessionContents.Variables[key] = value;
        fs.writeFileSync(sessionPath, this.stringify(sessionContents));
    }
}
function getEnvironmentPath(environmentName: string, fileExtension: string): string {
    return `${EntityType.Environment}/${environmentName}.${fileExtension}`;
}

function getDefaultFilePaths(requestFilePath: string, fileExtension: string, environmentName: string): string[] {
    const defaultEnvironments = ["globals.local", "globals", `${environmentName}.local`, environmentName].map((name) =>
        getEnvironmentPath(name, fileExtension)
    );
    const defaultFilePaths = [];
    let currentDirectory = dirname(requestFilePath);
    while (currentDirectory !== "." && currentDirectory !== "") {
        defaultFilePaths.push(`${currentDirectory}/defaults.${fileExtension}`);
        currentDirectory = dirname(currentDirectory);
    }
    return [...defaultEnvironments, ...defaultFilePaths.reverse()];
}
function applyChanges(destination: any, source: any): void {
    if (!source) {
        return;
    }
    for (const key of Object.keys(source)) {
        if (destination[key] !== undefined && typeof destination[key] === "object") {
            applyChanges(destination[key], source[key]);
        } else {
            destination[key] = source[key];
        }
    }
}

function checkRequired(fileContents: any): void {
    for (const key of REQUIRED_ON_REQUEST) {
        if (!fileContents[key]) {
            throw `Missing required key ${key}`;
        }
    }
}
function checkForbidden(fileContents: any): void {
    for (const key of NO_DEFAULT_ALLOWED) {
        if (fileContents[key]) {
            throw `Forbidden key ${key}`;
        }
    }
}
