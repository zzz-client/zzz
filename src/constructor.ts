import Letter from "./letter";
import fs = require("node:fs");
import { parse, stringify } from "yaml";

export default function Construct(requestFilePath: string, environmentName: string): Letter {
    const letter = new Letter();
    newInstance().apply(letter, requestFilePath, environmentName);
    return letter;
}
function newInstance(): IConstruct {
    return new DefaultInstance();
}
interface IConstruct {
    apply(letter: Letter, filePath: string, environmentName: string);
}

const REQUIRED_ON_REQUEST = ["Method", "URL"];
const NO_DEFAULT_ALLOWED = ["Method", "URL", "QueryParams", "Body"];

class DefaultInstance implements IConstruct {
    apply(letter: Letter, filePath: string, environmentName: string) {
        const defaultFiles = this.getFilePaths(filePath, environmentName);
        for (const path of defaultFiles) {
            const fileContents = this.loadFile(path);
            console.log(fileContents);
            this.checkForbidden(fileContents);
            this.applyFile(letter, fileContents);
        }
        const fileContents = this.loadFile(filePath);
        console.log(fileContents);
        this.checkRequired(fileContents);
        this.applyFile(letter, fileContents);
    }
    getFilePaths(requestFilePath: string, environmentName: string): string[] {
        const defaultFilePaths = []; // While not root directory (btw how can we know the root directory?)
        return [
            this.envPath("global.local"),
            this.envPath("global"),
            this.envPath(`${environmentName}.local`),
            this.envPath(`${environmentName}`),
            ...defaultFilePaths
        ];
    }
    loadFile(filePath: string): any {
        // TODO
        // throw new Error('Implement me using node or deno');
        if (!fs.existsSync(filePath)) {
            return null;
        }
        return parse(fs.readFileSync(filePath, "utf8"));
    }
    envPath(environmentName: string): string {
        return `../environments/${environmentName}.yml`;
    }
    checkRequired(fileContents: any): void {
        for (const key of REQUIRED_ON_REQUEST) {
            if (!fileContents[key]) {
                throw `Missing required key ${key}`;
            }
        }
    }
    checkForbidden(fileContents: any): void {
        for (const key of NO_DEFAULT_ALLOWED) {
            if (fileContents[key]) {
                throw `Forbidden key ${key}`;
            }
        }
    }
    applyFile(letter: Letter, fileContents: any): void {
        if (!fileContents) {
            return;
        }
        for (const key of Object.keys(fileContents)) {
            letter[key] = fileContents[key];
        }
    }
}
