import { Action, StringToStringMap, Trace } from "../../../lib/lib.ts";
import { getFileFormat } from "../../../storage/files/formats.ts";
import { Model } from "../../../storage/mod.ts";
import { FeatureFlags } from "../../mod.ts";
import Application from "../app.ts";
import { Scope } from "../modules/scope/mod.ts";
import { extname } from "https://deno.land/std/path/mod.ts";

const STANDARD_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "allow,content-type,x-zzz-context", "Access-Control-Allow-Methods": "GET,PATCH" };

export class Server {
  port: number;
  app: Application;
  constructor(app: Application) {
    this.port = app.argv!.http || 8000;
    this.app = app;
  }
  respond(request: Request): Promise<Response> {
    Trace("Server:Respond: Responding to " + request.method, request.url);
    switch (request.method) {
      case "GET":
        return this.respondToGet(request);
      case "PATCH":
        return this.respondToPatch(request);
      case "OPTIONS":
        return Promise.resolve(this.respondToOptions(request));
      default:
        return Promise.reject(
          new Response("Unsupported request method: " + request.method, {
            status: 400,
            headers: STANDARD_HEADERS,
          }),
        );
    }
  }
  listen(): Promise<void> {
    const pls = this;
    function cb(request: Request): Promise<Response> {
      return pls.respond(request).catch((error: any) => {
        if (error instanceof Response) {
          return Promise.resolve(error);
        }
        return Promise.resolve(newResponse(400, error, STANDARD_HEADERS));
      });
    }
    Trace("Starting server on port " + this.port);
    Deno.serve({ port: this.port }, cb);
    Trace("Server started (asynchronously)");
    return Promise.resolve();
  }

  async respondToGet(request: Request): Promise<Response> {
    const { pathname: url } = new URL(request.url);
    Trace("respondToGet " + url);
    if (url === "/favicon.ico") {
      Trace("Responding to favicon request");
      return newResponse(204, null, STANDARD_HEADERS);
      "";
    }
    if (url === "/") {
      Trace("Responding to base URL: scope list");
      return this.respondToScopesList();
    }
    const flagValues = this.app.argv as FeatureFlags;
    Trace("Flag values:", flagValues);
    const action = new Action(flagValues, this.app.env);
    const model = constructModelFromRequest(request);
    await this.app.executeModules(action, model);
    // (model as any).Body = { foo: "bar" }; // DEBUG
    console.log("result", model);
    // return this._do(request).then((result: Model) => this.respondUsingEntity(result, "Pass"));
    return Promise.resolve(newResponse(500, null, STANDARD_HEADERS));
  }
  respondToPatch(request: Request): Promise<Response> {
    Trace("Responding to PATCH");
    // TODO: Execute
    throw new Error("Not implemented");
  }
  respondToOptions(request: Request): Response {
    Trace("Responding to OPTIONS");
    const headers = {
      "Allow": ["OPTIONS", "GET"],
      ...STANDARD_HEADERS,
    };
    if (request.url !== "/") {
      Trace("PATCH allowed to execute requests");
      headers.Allow.push("PATCH}");
    }
    return new Response(null, {
      status: 204,
      headers: headers as any,
    });
  }
  async respondToScopesList(): Promise<Response> {
    Trace("Responding to Scopes list");
    const scopes = await this.app.store.list(Scope.name);
    Trace("Scopes:", scopes);
    const scopeIds = scopes.map((scope: Model) => scope.Id);
    Trace("Scope IDs:", scopeIds);
    return newResponse(200, this.stringify(scopeIds), STANDARD_HEADERS);
  }
  stringify(result: any): string {
    return getFileFormat(".json").stringify(result); // TODO: Hardcoded?
  }
}

function newResponse(status: number, body: any, headers: StringToStringMap): Response {
  return new Response(body, { status, headers });
}
function constructModelFromRequest(request: Request): Model {
  const parts = dissectRequest(request);
  Trace("Deconstructed request", parts);
  const model = new Model();
  model.Id = parts.fullId;
  return model;
}
function dissectRequest(request: Request): RequestParts {
  const { searchParams, pathname } = new URL(request.url);
  const extension = extname(pathname);
  const decodedPathname = decodeURI(pathname.replace(/^\//, ""));
  const scope = decodedPathname.split("/")[0];
  const entityId = decodedPathname.substring(scope.length + 1, decodedPathname.length - extension.length).replace(/^\./, "");
  const context = searchParams.get("context") || request.headers?.get("x-zzz-context") || "";
  return {
    context,
    scope,
    entityId,
    extension,
    fullId: (entityId ? (scope + "/" + entityId) : scope),
  };
}
type RequestParts = {
  context: string;
  entityId: string;
  scope: string;
  extension: string;
  fullId: string;
};
