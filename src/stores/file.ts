import { dirname } from "path";
import { IStore, checkForbidden, checkRequired } from "../store";
import Letter from "../letter";
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
    get(entityType: EntityType, entityName: string): any {
        if (entityType === EntityType.Request) {
            const letter = new Letter();
            this.load(letter, entityName, "Integrate");
            return letter;
        } else {
            const filePath = `${entityType}/${entityName}.${this.fileExtension}`;
            return this.parse(fs.readFileSync(filePath, "utf8"));
        }
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
