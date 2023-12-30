import Letter from "./request";
import { Parsers } from "./run";
import FileStore from "./stores/file";
import PostmanStore from "./stores/postman";
export enum EntityType {
    Request,
    Environment,
    Authorization
}

let instance: IStore = null;
function getInstance(): IStore {
    if (instance == null) {
        instance = newInstance("Postman");
    }
    return instance;
}

export default function Store(key: string, value: string, environmentName: string): any {
    return getInstance().store(key, value, environmentName);
}
export async function Get(entityType: EntityType, entityName: string, environmentName: string): Promise<any> {
    if (entityType === EntityType.Request) {
        return loadLetter(entityName, environmentName);
    } else {
        return getInstance().get(entityType, entityName, environmentName);
    }
}
export interface IStore {
    get(entityType: EntityType, entityName: string, environmentName: string): Promise<any>;
    store(key: string, value: any, environmentName: string): Promise<void>;
}
function newInstance(type: string): IStore {
    switch (type.toLowerCase()) {
        case "json":
            return new FileStore("json");
        case "yml":
        default:
            return new FileStore("yml");
        case "postman":
            return new PostmanStore("PostmanCollection.json");
    }
}

async function loadLetter(requestFilePath: string, environmentName: string): Promise<Letter> {
    const letter = await getInstance().get(EntityType.Request, requestFilePath, environmentName);
    loadBody(letter, requestFilePath, environmentName);
    return letter;
}
function loadBody(letter: Letter, requestFilePath: string, environmentName: string) {
    if (typeof letter.Body === "string") {
        letter.Body = Parsers["JSON"].parse(letter.Body); // TODO: Different for different types?
        return;
    }
}
