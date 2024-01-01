import { existsSync } from "https://deno.land/std/fs/mod.ts";
import ZzzRequest from "../request.ts";
import { EntityType, Get } from "../storage.ts";
import { basename, dirname, extname } from "https://deno.land/std/path/mod.ts";
import { IStore, Stores } from "../factories.ts";

export default class PostmanStore implements IStore {
  collection: CollectionSchema;
  constructor(collectionJsonFilePath: string) {
    if (existsSync(collectionJsonFilePath)) {
      this.collection = JSON.parse(Deno.readTextFileSync(collectionJsonFilePath));
    } else {
      this.collection = {} as CollectionSchema; // TODO: Bad but why is this happening
    }
  }
  // TODO: stat
  async get(entityType: EntityType, entityName: string, environmentName: string): Promise<any> {
    if (entityType === EntityType.Request) {
      return await loadRequest(this.collection, environmentName, entityName);
    }
    if (entityType === EntityType.Collection || entityType === EntityType.Folder) {
      return await Get(entityType, entityName, environmentName);
    }
    return Stores.YAML.get(entityType, entityName, environmentName);
  }
  async store(key: string, value: any): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
async function loadRequest(collection: CollectionSchema, environmentName: string, requestFilePath: string): Promise<ZzzRequest> {
  console.debug("Loading theRequest from postman collection: ", requestFilePath);
  // TODO: Write this so it cna work recursively
  const folderName = dirname(requestFilePath);
  const extension = extname(requestFilePath);
  const requestName = basename(requestFilePath, extension);
  const folder = collection.item.filter((item) => item.name === folderName)[0];
  const request = folder.item.filter((item) => item.name === requestName)[0].request;
  const theRequest = new ZzzRequest(requestName, request.url.raw.split("?")[0], request.method);
  if (request.body) {
    theRequest.Body = request.body.raw;
  }
  for (let header of request.header) {
    theRequest.Headers[header.key] = header.value;
  }
  for (let query of request.url.query) {
    theRequest.QueryParams[query.key] = query.value;
  }

  applyChanges(theRequest, await loadEnvironment("globals"));
  // applyChanges(theRequest, await loadEnvironment("globals.local", null));
  applyChanges(theRequest, await loadEnvironment(environmentName));
  applyChanges(theRequest, await loadEnvironment(environmentName + ".local"));
  applyChanges(theRequest, await loadEnvironment("session.local"));
  return theRequest;
}
async function loadEnvironment(target: string): Promise<ZzzRequest> {
  try {
    return (await Stores.YAML.get(EntityType.Environment, target, "Integrate")) as ZzzRequest;
  } catch (e) {
    return new ZzzRequest("", "", ""); // TODO: WHAT
  }
}
// TODO: Duplicate code
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
              },
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
                },
              ];
            };
            description: string;
          };
          response: [];
        },
      ];
    },
  ];
}
