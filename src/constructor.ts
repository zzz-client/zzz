import Letter from "./letter";
import Parse from "./parse";

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
            const fileContents = Parse(path);
            this.checkForbidden(fileContents);
            this.applyFile(letter, fileContents);
        }
        const fileContents = Parse(filePath);
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
    envPath(environmentName: string): string {
        return `./environments/${environmentName}.yml`;
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
