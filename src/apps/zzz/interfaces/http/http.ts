import { basename, extname } from "../../../../lib/deps.ts";
import { Action, Log, StringToStringMap, Trace } from "../../../../lib/etc.ts";
import { getFileFormat } from "../../../../storage/files/formats.ts";
import { Model } from "../../../../storage/mod.ts";
import IApplication, { FeatureFlags } from "../../../mod.ts";
import ExecuteActor from "../../actors/execute.ts";
import { Context } from "../../modules/context/mod.ts";
import { Collection, HttpRequest } from "../../modules/requests/mod.ts";
import { Scope } from "../../modules/scope/mod.ts";
import Application from "../cli/app.ts";

const STANDARD_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "allow,content-type,x-zzz-context", "Access-Control-Allow-Methods": "GET,PUT,PATCH" };

export function listen(server: IServer): Promise<void> {
  Trace("Starting server on port " + server.port);
  Deno.serve({ port: server.port }, (request: Request): Promise<Response> => {
    Trace("Server:Respond: Responding to " + request.method, request.url);
    switch (request.method) {
      case "GET":
        return server.respondToGet(request);
      case "POST":
        return server.respondToPost(request);
      case "PUT":
        return server.respondToPut(request);
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
  respondToPost(request: Request): Promise<Response>;
  respondToPut(request: Request): Promise<Response>;
  respondToPatch(request: Request): Promise<Response>;
  respondToDelete(request: Request): Promise<Response>;
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
    const { pathname } = new URL(request.url);
    Trace("respondToGet " + parts.fullId);
    if (pathname === "/favicon.ico") {
      Trace("Responding to favicon request");
      return Promise.resolve(newResponse(204, null, STANDARD_HEADERS));
    }
    if (pathname === "/") {
      Trace("Responding to base URL: scope list");
      return this.respondToList("json"); // TODO: At some point this should be configurable by the client somehow
    }
    const model = await this.executeGet(request);
    return Promise.resolve(newResponse(200, this.stringify(model, parts.extension || "json"), STANDARD_HEADERS));
  }
  async respondToPut(request: Request): Promise<Response> {
    const parts = dissectRequest(request);
    Trace("Responding to PUT");
    await this.executePut(request);
    return Promise.resolve(newResponse(200, this.stringify("^_^", parts.extension || "json"), STANDARD_HEADERS)); // TODO: What response? empty? what code?
  }
  async respondToPost(request: Request): Promise<Response> {
    Trace("Responding to POST");
    const parts = dissectRequest(request);
    await this.executePost(request);
    return Promise.resolve(newResponse(200, this.stringify("^_^", parts.extension || "json"), STANDARD_HEADERS)); // TODO: What response? empty? what code?
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
  async respondToDelete(request: Request): Promise<Response> {
    Trace("Responding to DELETE");
    const parts = dissectRequest(request);
    await this.executeDelete(request);
    return Promise.resolve(newResponse(200, this.stringify("^_^", parts.extension || "json"), STANDARD_HEADERS)); // TODO: What response? empty? what code?
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
  async respondToList(fileExtension: string): Promise<Response> {
    Trace("Responding to list");
    const scopes = await this.app.store.list(Scope.name);
    Trace("Scopes:", scopes);
    const scopeIds = scopes.map((scope: Model) => scope.Id);
    Trace("Scope IDs:", scopeIds);
    const contexts = await this.app.store.list(Context.name);
    Trace("Contexts:", contexts);
    const contextIds = contexts.map((context: Model) => context.Id); // .filter((contextId: string) => !contextId.includes(".local") && contextId != "globals")
    Trace("Context IDs:", contextIds);
    const body = {
      scopes: scopeIds,
      contexts: contextIds,
    };
    return newResponse(200, this.stringify(body, fileExtension), STANDARD_HEADERS);
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
    const modelId = getModelIdFromRequest(request);
    const model = await this.app.getModel(modelId, action);
    Log("Result", model);
    return Promise.resolve(model);
  }
  private async executePost(request: Request): Promise<void> {
    const model = await request.json() as Model;
    await this.app.insertModel(model);
  }
  private async executePut(request: Request): Promise<void> {
    const model = await request.json() as Model;
    await this.app.updateModel(model);
  }
  private async executeDelete(request: Request): Promise<void> {
    const parts = dissectRequest(request);
    await this.app.deleteModel(parts.fullId);
  }
}

// deno-lint-ignore no-explicit-any
function newResponse(status: number, body: any, headers: StringToStringMap): Response {
  return new Response(body, { status, headers });
}
function getModelIdFromRequest(request: Request): string {
  const parts = dissectRequest(request);
  if (parts.extension) {
    return parts.fullId.substring(0, parts.fullId.indexOf("."));
  } else {
    return parts.fullId;
  }
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

// TODO: Tests
