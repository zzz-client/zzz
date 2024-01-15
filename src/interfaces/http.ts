// import { basename, extname } from "path";
import { Collection, Entity, Model, ModelType, StringToStringMap } from "../core/models.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import tim from "../core/tim.ts";
import { DefaultFlags } from "../core/flags.ts";
import { Driver, getContentType, getDriver } from "../stores/files/drivers.ts";
import Application, { IActor, IStore } from "../core/app.ts";
import Log from "../core/log.ts";
import VariablesModule from "../modules/variables/index.ts";

interface IServer {
  respond(code: number, body: any, headers: StringToStringMap): any;
  listen(actorName: string): void;
}

const STANDARD_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

export class Server implements IServer {
  port: number;
  app: Application;
  constructor(app: Application) {
    this.port = app.argv.http || DefaultFlags.HTTP_PORT;
    this.app = app;
  }

  listen(): void {
    const pls = this;
    const callback = async (request: Request): Promise<Response> => {
      switch (request.method) {
        case "GET":
          Log("Responding to GET");
          return pls._respond(request, "Pass");
        case "POST":
          Log("Responding to POST");
          return pls._respond(request, "Client");
        case "OPTIONS":
          Log("Responding to OPTIONS", request.url);
          return Promise.resolve(this._handleOptions(request));
        default:
          return Promise.resolve(
            new Response("", {
              status: 400,
              headers: STANDARD_HEADERS,
            }),
          );
      }
    };
    Deno.serve({ port: this.port }, callback);
  }
  respond(status: number, body: any, headers: StringToStringMap): Response {
    return new Response(body, { status, headers });
  }
  _handleOptions(request: Request): Response {
    const headers = {
      "Allow": ["OPTIONS", "GET"],
      ...STANDARD_HEADERS,
    };
    if (request.url !== "/") {
      headers.Allow.push("POST");
    }
    return new Response(null, {
      status: 204,
      headers: headers,
    });
  }
  async _respond(request: Request, actorName: string): Promise<Response> {
    const store = await this.app.getStore();
    const { pathname: url } = new URL(request.url);
    if (url === "/favicon.ico") {
      return this.respond(200, {}, {});
    }
    const resourcePath = decodeURI(url.substring(1));
    let base = resourcePath;
    let ext = extname(resourcePath);
    if (ext.startsWith(".")) {
      ext = ext.substring(1);
      base = base.substring(0, base.length - ext.length - 1);
    }
    if ((base as string).endsWith("/")) {
      base = base.substring(0, base.length - 1);
    }
    if (request.method == "GET") {
      if (base === "") {
        return this.respond(200, getDriver(".json").stringify(await Collections(store)), STANDARD_HEADERS);
      }
      if (ext === "") {
        return this.respond(404, "", STANDARD_HEADERS);
      }
    }
    Log("Received request", request.method, "base=" + base, resourcePath);
    const { searchParams } = new URL(request.url);
    return store.get(ModelType.Entity, base, "integrate")
      .then((result: Entity) => {
        return this.app.applyModules(result).then(() => result);
      })
      .then((theRequest: Entity) => {
        if (searchParams.has("format") || searchParams.has("verbose") || actorName == "Client") {
          return VariablesModule.newInstance(this.app).load(theRequest)
            .then((variables) => {
              if (searchParams.has("verbose")) {
                theRequest.Variables = variables;
              }
              if (searchParams.has("format")) {
                tim(theRequest, variables);
              }
              return theRequest;
            });
        }
        return theRequest;
      })
      .then((theRequest: Entity) => {
        return this.app.getActor(actorName).then((actor: IActor) => {
          return actor.act(theRequest).catch((error) => error);
        });
      })
      .then((result: any) => {
        Log("Result", result);
        const driver = getDriver(".json");
        const parsedResult = driver.stringify(result);
        return this.respond(200, parsedResult, STANDARD_HEADERS);
      })
      .catch((reason: any) => {
        console.error(reason.message);
        console.error(reason);
        return this.respond(500, reason, STANDARD_HEADERS);
      });
  }
}
async function Collections(store: IStore): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["Salesforce Primary"];
  for (const collection of collections) {
    result.push(await store.get(ModelType.Collection, collection, "integrate")); // TODO: Hardcoded
  }
  return result;
}
