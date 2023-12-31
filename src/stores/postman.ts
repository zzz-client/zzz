import Request, { AnyNonPromise } from "../request";
import fs = require("node:fs");
import path = require("node:path");
import { EntityType, IStore, Stores } from "../store";

export default class PostmanStore implements IStore {
    collection: CollectionSchema;
    constructor(collectionJsonFilePath) {
        this.collection = JSON.parse(fs.readFileSync(collectionJsonFilePath, "utf8"));
    }
    async get(entityType: EntityType, entityName: string, environmentName: string): Promise<any> {
        if (entityType === EntityType.Request) {
            return await loadRequest(this.collection, environmentName, entityName);
        }
        return Stores.YAML.get(entityType, entityName, environmentName);
    }
    async store<T>(key: string, value: AnyNonPromise<T>): Promise<void> {
        throw new Error("Method not implemented.");
    }
}
async function loadRequest(collection: CollectionSchema, environmentName: string, requestFilePath: string): Promise<Request> {
    const theRequest = new Request();
    console.debug("Loading theRequest from postman collection: ", requestFilePath);
    // TODO: Write this so it cna work recursively
    const folderName = path.dirname(requestFilePath);
    const extension = path.extname(requestFilePath);
    const requestName = path.basename(requestFilePath, extension);
    const folder = collection.item.filter((item) => item.name === folderName)[0];
    const request = folder.item.filter((item) => item.name === requestName)[0].request;
    theRequest.Method = request.method;
    theRequest.URL = request.url.raw.split("?")[0];
    if (request.body) {
        theRequest.Body = request.body.raw;
    }
    for (let header of request.header) {
        theRequest.Headers[header.key] = header.value;
    }
    for (let query of request.url.query) {
        theRequest.QueryParams[query.key] = query.value;
    }
    applyChanges(theRequest, await loadEnvironment("globals", null));
    // applyChanges(theRequest, await loadEnvironment("globals.local", null));
    applyChanges(theRequest, await loadEnvironment(environmentName, environmentName));
    applyChanges(theRequest, await loadEnvironment(environmentName + ".local", environmentName));
    applyChanges(theRequest, await loadEnvironment("session.local", null));
    return theRequest;
}
async function loadEnvironment(target: string, environmentName: string): Promise<Request> {
    try {
        return await Stores.YAML.get(EntityType.Environment, target, environmentName);
    } catch (e) {
        return new Request();
    }
}
// TODO: Duplicate code
function applyChanges<T>(destination: AnyNonPromise<T>, source: AnyNonPromise<T>): void {
    // console.log("Applying", source, "to", destination);
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
// TODO: Duplicate code
interface StringToStringMap {
    [key: string]: string;
}
interface CollectionSchema {
    info: {
        _postman_id: string;
        name: string;
        schema: string;
        _exporter_id: string;
        _collection_link: string;
    };
    item: [
        {
            name: string;
            item: [
                {
                    name: string;
                    request: {
                        method: string;
                        header: [
                            {
                                key: string;
                                value: string;
                                description: string;
                            }
                        ];
                        body: {
                            mode: string;
                            raw: string;
                        };
                        url: {
                            raw: string;
                            protocol: string;
                            host: string[];
                            path: string[];
                            query: [
                                {
                                    key: string;
                                    value: string;
                                }
                            ];
                        };
                        description: string;
                    };
                    response: [];
                }
            ];
        }
    ];
}
