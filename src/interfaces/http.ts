// import { basename, extname } from "path";
import { Collection, Entity, Model, ModelType, Scope, StringToStringMap } from "../core/models.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import tim from "../core/tim.ts";
import { DefaultFlags } from "../core/flags.ts";
import { Driver, getContentType, getDriver } from "../stores/files/drivers.ts";
import Application, { IActor, IStore } from "../core/app.ts";
import Log from "../core/log.ts";
import VariablesModule from "../modules/variables/index.ts";
import PathParamsModule from "../modules/path-params/index.ts";

interface IServer {
  // respond(code: number, body: any, headers: StringToStringMap): any;
  listen(): void;
}

const STANDARD_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "allow,content-type,x-zzz-context", "Access-Control-Allow-Methods": "GET,PATCH" };

export class Server implements IServer {
  port: number;
  app: Application;
  constructor(app: Application) {
    this.port = app.argv.http || DefaultFlags.HTTP_PORT;
    this.app = app;
  }

  respond(request: Request): Promise<Response> {
    const pls = this;
    switch (request.method) {
      case "GET": {
        Log("Responding to GET", request.url);
        return pls._do(request, "Pass").then((result: Entity | Scope) => this._respond(result, "Pass"));
      }
      case "PATCH":
        Log("Responding to PATCH", request.url);
        return pls._do(request, "Client").then((result: Entity | Scope) => {
          console.log("Hmm", result);
          return this._respond(result, "Client");
        });
      case "OPTIONS":
        Log("Responding to OPTIONS", request.url);
        return Promise.resolve(this._handleOptions(request));
      default:
        return Promise.reject(
          new Response("Unsupported request method: " + request.method, {
            status: 400,
            headers: STANDARD_HEADERS,
          }),
        );
    }
  }
  listen(): void {
    const pls = this;
    function cb(request: Request): Promise<Response> {
      return pls.respond(request).catch((error: any) => {
        if (error instanceof Response) {
          return Promise.resolve(error);
        }
        return Promise.resolve(pls.newResponse(400, error, STANDARD_HEADERS));
      });
    }
    Deno.serve({ port: this.port }, cb);
  }
  newResponse(status: number, body: any, headers: StringToStringMap): Response {
    return new Response(body, { status, headers });
  }
  _handleOptions(request: Request): Response {
    const headers = {
      "Allow": ["OPTIONS", "GET"],
      ...STANDARD_HEADERS,
    };
    if (request.url !== "/") {
      headers.Allow.push("PATCH}");
    }
    return new Response(null, {
      status: 204,
      headers: headers as any,
    });
  }
  handleExtraRequestCases(request: Request): Response | string {
    const { pathname: url } = new URL(request.url);
    if (url === "/favicon.ico") {
      return this.newResponse(200, {}, STANDARD_HEADERS);
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
    if (request.method == "GET" && base !== "" && ext === "") {
      return this.newResponse(404, "", STANDARD_HEADERS);
    }
    return base;
  }
  async _do(request: Request, actorName: string): Promise<Entity | Scope> {
    const store = await this.app.getStore();
    const context = getContext(request);
    const { searchParams } = new URL(request.url);
    const isVerbose = searchParams.has("verbose");
    const isFormat = searchParams.has("format") || actorName == "Client";
    const extraCaseResult = this.handleExtraRequestCases(request);
    if (request.method == "GET" && extraCaseResult == "") {
      return getScopes(request, store);
    }

    return store.get(ModelType.Entity, extraCaseResult as string, context)
      .then((result: Entity) => {
        return this.app.applyModules(result).then(() => result);
      })
      .then((entity: Entity) => {
        if (isVerbose || isFormat) {
          return VariablesModule.newInstance(this.app).load(entity, context)
            .then((variables) => {
              if (isVerbose) {
                entity.Variables = variables;
              }
              if (isFormat) {
                tim(entity, variables);
              }
              return entity;
            });
        }
        return entity;
      })
      .then((entity: Entity) => {
        if (isFormat) {
          return PathParamsModule.newInstance(this.app).mod(entity as Entity, this.app.config);
        }
        return entity;
      });
  }
  _respond(theRequest: Entity | Scope, actorName: string): Promise<Response> {
    return this.app.getActor(actorName).then((actor: IActor) => {
      console.log("acting");
      if (theRequest instanceof Entity) {
        return actor.act(theRequest);
      }
      return Promise.resolve(theRequest);
    })
      .then((result: any) => {
        Log("Final response", result);
        let finalResponse = result;
        if (!(result instanceof Response)) {
          Log("Stringifying result");
          const driver = getDriver(".json");
          const stringResult = driver.stringify(result);
          finalResponse = this.newResponse(200, stringResult, STANDARD_HEADERS);
        }
        return finalResponse;
      })
      .catch((reason: any) => {
        console.error(reason.message);
        console.error(reason);
        console.error(reason.stacktrace);
        return this.newResponse(500, reason, STANDARD_HEADERS);
      });
  }
}
async function getScopes(request: Request, store: IStore): Promise<Scope[]> {
  return store.getAll(ModelType.Scope);
}
function getContext(request: Request): string {
  const { searchParams } = new URL(request.url);
  const headers = request.headers || {};
  return searchParams.get("context") || headers.get("x-zzz-context") || "";
}
function getScope(request: Request): string {
  console.log(decodeURI(request.url.split(":8000/")[1]));
  return decodeURI(request.url.split(":8000/")[1]);
}
