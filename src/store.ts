import Request from "./request";
import { Parsers } from "./run";
import FileStore from "./stores/file";
import PostmanStore from "./stores/postman";
export enum EntityType {
    Request,
    Environment,
    Authorization
}
export function getInstance(): IStore {
    return instance;
}
export const Stores = {
    Postman: newInstance("postman"),
    JSON: newInstance("json"),
    YAML: newInstance("yaml"),
    XML: newInstance("xml")
};
const instance: IStore = Stores.YAML; // TODO: Make dynamic somehow

export default function Store(key: string, value: string, environmentName: string): any {
    return getInstance().store(key, value, environmentName);
}
export async function Get(entityType: EntityType, entityName: string, environmentName: string): Promise<any> {
    if (entityType === EntityType.Request) {
        return loadRequest(entityName, environmentName);
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
        case "xml":
            return new FileStore("xml");
        case "postman":
            return new PostmanStore("PostmanCollection.json");
    }
}

async function loadRequest(requestFilePath: string, environmentName: string): Promise<Request> {
    const theRequest = await getInstance().get(EntityType.Request, requestFilePath, environmentName);
    loadBody(theRequest, requestFilePath, environmentName);
    return theRequest;
}
function loadBody(theRequest: Request, requestFilePath: string, environmentName: string) {
    if (typeof theRequest.Body === "string") {
        theRequest.Body = Parsers["JSON"].parse(theRequest.Body); // TODO: Different for different types?
        return;
    }
}
