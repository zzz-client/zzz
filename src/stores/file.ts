import { dirname } from "path";
import { IStore } from "../store";
import Letter, { AnyNonPromise } from "../letter";
import { EntityType } from "../store";
import fs = require("node:fs");

export default class FileStore implements IStore {
    fileExtension: string;
    parse: Function;
    stringify: Function;
    constructor(fileExtension: string, parseMethod: Function, stringifyMethod: Function) {
        this.fileExtension = fileExtension;
        this.parse = parseMethod;
        this.stringify = stringifyMethod;
    }
    get<T>(entityType: EntityType, entityName: string, environmentName: string): Promise<AnyNonPromise<T>> {
        if (entityType === EntityType.Request) {
            const letter = new Letter();
            this.load(letter, entityName, environmentName);
            return Promise.resolve(letter);
        } else {
            const filePath = `${entityType}/${entityName}.${this.fileExtension}`;
            return this.parse(fs.readFileSync(filePath, "utf8"));
        }
    }
    store<T>(key: string, value: AnyNonPromise<T>): Promise<void> {
        const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
        let sessionContents: { Variables: AnyNonPromise<T> };
        if (fs.existsSync(sessionPath)) {
            sessionContents = this.parse(fs.readFileSync(sessionPath, "utf8"));
        } else {
            sessionContents = { Variables: {} as AnyNonPromise<T> };
        }
        sessionContents.Variables[key] = value;
        fs.writeFileSync(sessionPath, this.stringify(sessionContents));
        return Promise.resolve();
    }
    load(letter: Letter, requestFilePath: string, environmentName: string): void {
        const defaultFilePaths = getDefaultFilePaths("requests/" + requestFilePath, this.fileExtension, environmentName);
        for (const filePath of defaultFilePaths) {
            if (fs.existsSync(filePath)) {
                const fileContents = this.parse(fs.readFileSync(filePath, "utf8"));
                checkForbidden(fileContents);
                applyChanges(letter, fileContents);
            }
        }
        const fileContents = this.parse(fs.readFileSync("requests/" + requestFilePath + "." + this.fileExtension, "utf8"));
        checkRequired(fileContents);
        applyChanges(letter, fileContents);
        const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
        if (fs.existsSync(sessionPath)) {
            const sessionContents = this.parse(fs.readFileSync(sessionPath, "utf8"));
            applyChanges(letter, sessionContents);
        }
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
function applyChanges<T>(destination: AnyNonPromise<T>, source: AnyNonPromise<T>): void {
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

const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];
function checkRequired<T>(fileContents: AnyNonPromise<T>): void {
    for (const key of REQUIRED_ON_REQUEST) {
        if (!fileContents[key]) {
            throw `Missing required key ${key}`;
        }
    }
}
function checkForbidden<T>(fileContents: AnyNonPromise<T>): void {
    for (const key of NO_DEFAULT_ALLOWED) {
        if (fileContents[key]) {
            throw `Forbidden key ${key}`;
        }
    }
}
