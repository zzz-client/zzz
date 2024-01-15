// import { basename, extname } from "path";
import { Collection, Entity, Model, ModelType, StringToStringMap } from "../core/models.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import tim from "../core/tim.ts";
import { DefaultFlags } from "../core/flags.ts";
import { Driver, getContentType, getDriver } from "../stores/files/drivers.ts";
import Application, { IActor, IStore } from "../core/app.ts";
import Log from "../core/log.ts";
import VariablesModule from "../modules/variables/index.ts";
import PathParamsModule from "../modules/path-params/index.ts";

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
          return pls._do(request, "Pass").then((result) => this._respond(result, "Pass"));
        case "PATCH":
          Log("Responding to PATCH");
          return pls._do(request, "Client").then((result) => this._respond(result, "Client"));
        case "OPTIONS":
          Log("Responding to OPTIONS", request.url);
          return Promise.resolve(this._handleOptions(request));
        default:
          return Promise.resolve(
            new Response("Unsupported request method: " + request.method, {
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
  async _do(request: Request, actorName: string): Promise<Response> {
    const store = await this.app.getStore();
    const { pathname: url } = new URL(request.url);
    if (url === "/favicon.ico") {
      return this.respond(200, {}, {});
    }
    const resourcePath = decodeURI(url.substring(1));
    const context = getContext(request);
    const scope = getScope(request);
    let base = scope + "/" + resourcePath;
    let ext = extname(resourcePath);
    if (ext.startsWith(".")) {
      ext = ext.substring(1);
      base = base.substring(0, base.length - ext.length - 1);
    }
    if ((base as string).endsWith("/")) {
      base = base.substring(0, base.length - 1);
    }
    if (request.method == "GET") {
      if (base == scope) {
        const collections = await Collections(request, store);
        return collections;
      }
      if (ext === "") {
        return this.respond(404, "", STANDARD_HEADERS);
      }
    }
    Log("Received request", request.method, "base=" + base, resourcePath);
    const { searchParams } = new URL(request.url);
    const isVerbose = searchParams.has("verbose");
    const isFormat = searchParams.has("format") || actorName == "Client";
    return store.get(ModelType.Entity, base, context)
      .then((result: Entity) => {
        return this.app.applyModules(result).then(() => result);
      })
      .then((theRequest: Entity) => {
        if (isVerbose || isFormat) {
          return VariablesModule.newInstance(this.app).load(theRequest, context)
            .then((variables) => {
              if (isVerbose) {
                theRequest.Variables = variables;
              }
              if (isFormat) {
                tim(theRequest, variables);
              }
              return theRequest;
            });
        }
        return theRequest;
      })
      .then((model: Model) => {
        if (isFormat) {
          return PathParamsModule.newInstance(this.app).mod(model);
        }
        return Promise.resolve(model);
      })
      .then((model: Model) => {
        return this._respond(model, actorName);
      });
  }
  _respond(theRequest: Entity, actorName: string) {
    return this.app.getActor(actorName).then((actor: IActor) => {
      return actor.act(theRequest).catch((error) => error);
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
async function Collections(request: Request, store: IStore): Promise<Collection[]> {
  const result = [] as Collection[];
  const scope = getScope(request);
  const context = getContext(request);
  const scopeModel = await store.get(ModelType.Scope, scope, context);
  return Promise.resolve(scopeModel.Collections);
}
function getContext(request: Request): string {
  const { searchParams } = new URL(request.url);
  const headers = request.headers || {};
  return searchParams.get("context") || headers.get("x-zzz-context");
}
function getScope(request: Request): string {
  const { searchParams } = new URL(request.url);
  const headers = request.headers || {};
  return searchParams.get("scope") || headers.get("x-zzz-scope");
}

