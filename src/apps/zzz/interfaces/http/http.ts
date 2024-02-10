import { basename } from "https://deno.land/std@0.210.0/path/basename.ts";
import { Action, Log, StringToStringMap, Trace } from "../../../../lib/etc.ts";
import { getFileFormat } from "../../../../storage/files/formats.ts";
import { Model } from "../../../../storage/mod.ts";
import IApplication, { executeModules, FeatureFlags } from "../../../mod.ts";
import { Scope } from "../../modules/scope/mod.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import ExecuteActor from "../../actors/execute.ts";
import { Collection, HttpRequest } from "../../modules/requests/mod.ts";
import Application from "../cli/app.ts";

const STANDARD_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "allow,content-type,x-zzz-context", "Access-Control-Allow-Methods": "GET,PATCH" };

export function listen(server: Server): Promise<void> {
  Trace("Starting server on port " + server.port);
  Deno.serve({ port: server.port }, (request: Request): Promise<Response> => {
    Trace("Server:Respond: Responding to " + request.method, request.url);
    switch (request.method) {
      case "GET":
        return server.respondToGet(request);
      case "PATCH":
        return server.respondToPatch(request);
      case "OPTIONS":
        return Promise.resolve(server.respondToOptions(request));
      default:
        return Promise.reject(
          new Response("Unsupported request method: " + request.method, {
            status: 400,
            headers: STANDARD_HEADERS,
          }),
        );
    }
  });
  Trace("Server started (asynchronously)");
  return Promise.resolve();
}

export interface IServer {
  port: number;
  app: IApplication;
  respondToGet(request: Request): Promise<Response>;
  respondToPatch(request: Request): Promise<Response>;
  respondToOptions(request: Request): Promise<Response>;
}

export class Server implements IServer {
  port: number;
  app: Application;
  constructor(app: Application) {
    this.port = app.argv!.http || 8000;
    this.app = app;
  }
  async respondToGet(request: Request): Promise<Response> {
    const parts = dissectRequest(request);
    parts.fullId;
    Trace("respondToGet " + parts.fullId);
    if (parts.fullId === "/favicon.ico") {
      Trace("Responding to favicon request");
      return Promise.resolve(newResponse(204, null, STANDARD_HEADERS));
    }
    if (parts.fullId === "/" || basename(parts.fullId) == "/") {
      Trace("Responding to base URL: scope list");
      return this.respondToScopesList(extname(parts.fullId));
    }
    const model = await this.executeGet(request);
    return Promise.resolve(newResponse(200, this.stringify(model, parts.extension || "json"), STANDARD_HEADERS));
  }
  async respondToPatch(request: Request): Promise<Response> {
    const parts = dissectRequest(request);
    Trace("Responding to PATCH");
    const model = await this.executeGet(request);
    if (!(model instanceof HttpRequest)) {
      return Promise.resolve(newResponse(400, this.stringify({ message: "PATCH only supported for Requests" }, parts.extension), STANDARD_HEADERS));
    }
    const executeResponse = await (new ExecuteActor()).act(model);
    return Promise.resolve(newResponse(200, this.stringify(executeResponse, parts.extension || "json"), STANDARD_HEADERS));
  }
  respondToOptions(request: Request): Promise<Response> {
    Trace("Responding to OPTIONS");
    const headers = {
      "Allow": ["OPTIONS", "GET"],
      ...STANDARD_HEADERS,
    };
    if (request.url !== "/") {
      Trace("PATCH allowed to execute requests");
      headers.Allow.push("PATCH}");
    }
    return Promise.resolve(
      new Response(null, {
        status: 204,
        headers: headers as unknown as HeadersInit,
      }),
    );
  }
  async respondToScopesList(fileExtension: string): Promise<Response> {
    Trace("Responding to Scopes list");
    const scopes = await this.app.store.list(Scope.name);
    Trace("Scopes:", scopes);
    const scopeIds = scopes.map((scope: Model) => scope.Id);
    Trace("Scope IDs:", scopeIds);
    return newResponse(200, this.stringify(scopeIds, fileExtension), STANDARD_HEADERS);
  }
  // deno-lint-ignore no-explicit-any
  private stringify(result: any, fileExtension = "json"): string {
    return getFileFormat(fileExtension).stringify(result);
  }
  private async executeGet(request: Request): Promise<Model> {
    const parts = dissectRequest(request);
    const flagValues = this.app.argv as FeatureFlags;
    Trace("Flag values:", flagValues);
    flagValues.context = parts.context || flagValues.context;
    flagValues.scope = parts.scope || flagValues.scope;
    const action = new Action(flagValues, this.app.env);
    const model = constructModelFromRequest(request);
    await executeModules(this.app.modules, action, model);
    Log("Result", model);
    return Promise.resolve(model);
  }
}

// deno-lint-ignore no-explicit-any
function newResponse(status: number, body: any, headers: StringToStringMap): Response {
  return new Response(body, { status, headers });
}
function constructModelFromRequest(request: Request): Model {
  const parts = dissectRequest(request);
  Trace("Deconstructed request", parts);
  let model;
  if (parts.extension) {
    model = new HttpRequest();
    model.Id = parts.fullId.substring(0, parts.fullId.indexOf("."));
  } else {
    model = new Collection();
    model.Id = parts.fullId;
  }
  return model;
}
function dissectRequest(request: Request): RequestParts {
  const { searchParams, pathname } = new URL(request.url);
  const extension = extname(pathname).replace("\.", "");
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
