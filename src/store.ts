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
export interface IStore {
    load(letter: Letter, requestFilePath: string, environmentName: string): void;
    get(entityType: EntityType, entityName: string): any;
}
export function Get(entityType: EntityType, entityName: string): any {
    return YamlStore().get(entityType, entityName);
}
export function Load(requestFilePath: string, environmentName: string): any {
    const letter = new Letter();
    YamlStore().load(letter, requestFilePath, environmentName);
    return letter;
}
const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];

function YamlStore(): IStore {
    return new FileStore("yml", YAML.parse);
}
function JsonStore(): IStore {
    return new FileStore("json", JSON.parse);
}
class FileStore implements IStore {
    fileExtension: string;
    parse: Function;
    constructor(fileExtension: string, parseMethod: Function) {
        this.fileExtension = fileExtension;
        this.parse = parseMethod;
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
    }
    get(entityType: EntityType, entityName: string): any {
        const filePath = `${entityType}/${entityName}.${this.fileExtension}`;
        return this.parse(fs.readFileSync(filePath, "utf8"));
    }
}
function getEnvironmentPath(environmentName: string, fileExtension: string): string {
    return `${EntityType.Environment}/${environmentName}.${fileExtension}`;
}

function getDefaultFilePaths(requestFilePath: string, fileExtension: string, environmentName: string): string[] {
    const defaultEnvironments = ["global.local", "global", `${environmentName}.local`, environmentName].map((name) => getEnvironmentPath(name, fileExtension));
    const defaultFilePaths = [];
    let currentDirectory = dirname(requestFilePath);
    while (currentDirectory !== "." && currentDirectory !== "") {
        defaultFilePaths.push(`${currentDirectory}/defaults.${fileExtension}`);
        currentDirectory = dirname(currentDirectory);
    }
    return [...defaultEnvironments, ...defaultFilePaths.reverse()];
}
function applyChanges(letter: Letter, fileContents: any): void {
    if (!fileContents) {
        return;
    }
    for (const key of Object.keys(fileContents)) {
        letter[key] = fileContents[key];
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
