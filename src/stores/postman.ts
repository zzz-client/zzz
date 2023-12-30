import * as YAML from "yaml";
import { IStore } from "../store";
import Letter from "../letter";
import { EntityType } from "../store";
import fs = require("node:fs");
import FileStore from "./file";

export default class PostmanStore implements IStore {
    collection: Schema;
    constructor(collectionJsonFilePath) {
        this.collection = JSON.parse(fs.readFileSync(collectionJsonFilePath, "utf8"));
    }
    load(letter: Letter, requestFilePath: string, environmentName: string): void {
        // TODO: Write this so it cna work recursively
        const [folderName, requestName] = requestFilePath.split("/");
        const folder = this.collection.item.filter((item) => item.name === folderName)[0];
        const request = folder.item.filter((item) => item.name === requestName)[0].request;
        letter.Method = request.method;
        letter.URL = request.url.raw.split("?")[0];
        if (request.body) {
            letter.Body = request.body.raw;
        }
        for (let header of request.header) {
            letter.Headers[header.key] = header.value;
        }
        for (let query of request.url.query) {
            letter.QueryParams[query.key] = query.value;
        }
        const childLetter = new Letter();
        new FileStore("yml", YAML.parse, YAML.stringify).load(childLetter, requestFilePath, environmentName);
        letter.Variables = childLetter.Variables;
    }
    get(entityType: EntityType, entityName: string) {
        throw new Error("Method not implemented.");
    }
    store(key: string, value: any): void {
        throw new Error("Method not implemented.");
    }
}

interface Schema {
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
