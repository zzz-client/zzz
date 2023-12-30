import { basename, dirname } from "path";
import Letter, { AnyNonPromise } from "../request";
import { EntityType, IStore } from "../store";
import fs = require("node:fs");
import { Parser, Parsers } from "../run";

export default class FileStore implements IStore {
    fileExtension: string;
    constructor(fileExtension: string) {
        this.fileExtension = fileExtension;
    }
    parser(): Parser {
        return Parsers[this.fileExtension.toUpperCase()];
    }
    get<T>(entityType: EntityType, entityName: string, environmentName: string): Promise<AnyNonPromise<T>> {
        if (entityType === EntityType.Request) {
            const letter = new Letter();
            this.load(letter, entityName, environmentName);
            return Promise.resolve(letter);
        } else {
            const entityFolder = getDirectoryForEntity(entityType);
            const filePath = `${entityFolder}/${entityName}.${this.fileExtension}`;
            return this.parser().parse(fs.readFileSync(filePath, "utf8"));
        }
    }
    store<T>(key: string, value: AnyNonPromise<T>): Promise<void> {
        const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
        let sessionContents: { Variables: AnyNonPromise<T> };
        if (fs.existsSync(sessionPath)) {
            sessionContents = this.parser().parse(fs.readFileSync(sessionPath, "utf8"));
        } else {
            sessionContents = { Variables: {} as AnyNonPromise<T> };
        }
        sessionContents.Variables[key] = value;
        fs.writeFileSync(sessionPath, this.parser().stringify(sessionContents));
        return Promise.resolve();
    }
    load(letter: Letter, requestId: string, environmentName: string): void {
        const defaultFilePaths = getDefaultFilePaths("requests/" + requestId, this.fileExtension, environmentName);
        for (const defaultFilePath of defaultFilePaths) {
            if (fs.existsSync(defaultFilePath)) {
                const fileContents = this.parser().parse(fs.readFileSync(defaultFilePath, "utf8"));
                checkForbidden(fileContents);
                applyChanges(letter, fileContents);
            }
        }
        const X = "requests/" + requestId + "." + this.fileExtension;
        const fileContents = this.parser().parse(fs.readFileSync(X, "utf8"));
        checkRequired(fileContents);
        applyChanges(letter, fileContents);
        const sessionPath = getEnvironmentPath("session.local", this.fileExtension);
        if (fs.existsSync(sessionPath)) {
            const sessionContents = this.parser().parse(fs.readFileSync(sessionPath, "utf8"));
            applyChanges(letter, sessionContents);
        }
    }
}
function getDirectoryForEntity(entityType: EntityType): string {
    switch (entityType) {
        case EntityType.Request:
            return "requests";
        case EntityType.Environment:
            return "environments";
        case EntityType.Authorization:
            return "authorizations";
        default:
            throw `Unknown entity type ${entityType}`;
    }
}
function getEnvironmentPath(environmentName: string, fileExtension: string): string {
    return getDirectoryForEntity(EntityType.Environment) + `/${environmentName}.${fileExtension}`;
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
