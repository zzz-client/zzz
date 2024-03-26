import ExecuteActor from "../core/actors/execute.ts";
import IApplication, { executeHooks, executeModules, FeatureFlags } from "../core/app.ts";
import { extname } from "../core/deps.ts";
import { Action, Log, StringToStringMap, Trace } from "../core/etc.ts";
import { Context } from "../core/modules/context/mod.ts";
import { HttpRequest } from "../core/modules/requests/mod.ts";
import { Scope } from "../core/modules/scope/mod.ts";
import { getFileFormat } from "../core/storage/files/formats.ts";
import { Model } from "../core/storage/mod.ts";
import { OptionsResponse } from "../web/components/Utils.axios.ts";
import Application from "./app.ts";

const DEFAULT_FILETYPE = "json";
const STANDARD_HEADERS = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "allow,content-type,x-zzz-context,x-zzz-scope", "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,PATCH,DELETE" };

export function listen(server: IServer): Promise<void> {
  Trace("Starting server on port " + server.port);
  Deno.serve({ port: server.port }, (request: Request): Promise<Response> => {
    Trace("Server:Respond: Responding to " + request.method, request.url);
    try {
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
          return server.respondToOptions(request);
      }
      return Promise.reject(
        new Response("Unsupported request method: " + request.method, {
          status: 400,
          headers: STANDARD_HEADERS,
        }),
      );
    } catch (error) {
      console.log("Error caught");
      const errorMsg = error instanceof Error ? error.message : error;
      return Promise.reject(new Response(errorMsg, { status: 500, headers: STANDARD_HEADERS }));
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
  allowPatch: boolean;
  constructor(app: Application, allowPatch: boolean) {
    this.port = app.argv!.http || 8000;
    this.app = app;
    this.allowPatch = allowPatch;
  }
  async respondToGet(request: Request): Promise<Response> {
    const parts = dissectRequest(request);
    const { pathname } = new URL(request.url);
    Trace("respondToGet " + parts.entityId);
    if (pathname === "/favicon.ico") {
      return this.respondToFavicon();
    }
    let model: Model;
    try {
      model = await this.executeGet(request);
    } catch (error) {
      if (error.message.includes("Unable to determine model type for ID")) {
        return newResponse(404, this.stringify({ message: "No such entity " + parts.entityId }, parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS);
      } else {
        throw error;
      }
    }
    return Promise.resolve(newResponse(200, this.stringify(model, parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS));
  }
  private respondToFavicon(): Promise<Response> {
    return Promise.resolve(newResponse(204, null, STANDARD_HEADERS));
  }
  async respondToPut(request: Request): Promise<Response> {
    const parts = dissectRequest(request);
    Trace("Responding to PUT");
    await this.executePut(request);
    return Promise.resolve(newResponse(200, this.stringify("^_^", parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS)); // TODO: What response? empty? what code?
  }
  async respondToPost(request: Request): Promise<Response> {
    Trace("Responding to POST");
    const parts = dissectRequest(request);
    await this.executePost(request);
    return Promise.resolve(newResponse(200, this.stringify("^_^", parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS)); // TODO: What response? empty? what code?
  }
  async respondToPatch(request: Request): Promise<Response> {
    if (!this.allowPatch) {
      return Promise.resolve(newResponse(405, this.stringify({ message: "PATCH not supported" }, DEFAULT_FILETYPE), STANDARD_HEADERS));
    }
    const parts = dissectRequest(request);
    Trace("Responding to PATCH");
    let model: Model;
    try {
      model = await this.executeGet(request);
    } catch (error) {
      if (error.message.includes("Unable to determine model type for ID")) {
        return newResponse(404, this.stringify({ message: "No such entity " + parts.entityId }, parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS);
      } else {
        throw error;
      }
    }
    if (!("Method" in model)) {
      return Promise.resolve(newResponse(400, this.stringify({ message: "PATCH only supported for Requests" }, parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS));
    }
    const action = new Action(this.app.argv as FeatureFlags, this.app.env);
    try {
      await executeHooks("Before", model, action);
      const executeResponse = await (new ExecuteActor()).act(model);
      await executeHooks("After", model, executeResponse);
      return Promise.resolve(newResponse(200, this.stringify(executeResponse, parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS));
    } catch (error) {
      return newResponse(599, this.stringify({ message: "Error: " + error }, parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS);
    }
  }
  async respondToDelete(request: Request): Promise<Response> {
    Trace("Responding to DELETE");
    const parts = dissectRequest(request);
    await this.executeDelete(request);
    return Promise.resolve(newResponse(200, this.stringify("^_^", parts.extension || DEFAULT_FILETYPE), STANDARD_HEADERS)); // TODO: What response? empty? what code?
  }
  async respondToOptions(request: Request): Promise<Response> {
    Trace("Responding to OPTIONS");
    const headers = {
      "Allow": ["OPTIONS", "GET"],
      ...STANDARD_HEADERS,
    };
    if (request.url !== "/" && this.allowPatch) {
      headers.Allow.push("PATCH");
    }
    const body = await this.getList();
    return Promise.resolve(
      new Response(this.stringify(body, DEFAULT_FILETYPE), {
        status: 200,
        headers: headers as unknown as HeadersInit,
      }),
    );
  }
  async getList(): Promise<OptionsResponse> {
    const scopes = await this.app.store.list(Scope.name);
    Trace("Scopes:", scopes);
    const scopeIds = scopes.map((scope: Model) => scope.Id);
    Trace("Scope IDs:", scopeIds);
    const contexts = await this.app.store.list(Context.name);
    Trace("Contexts:", contexts);
    const contextIds = contexts.map((context: Model) => context.Id); // .filter((contextId: string) => !contextId.includes(".local") && contextId != "globals")
    Trace("Context IDs:", contextIds);
    return {
      scopes: scopeIds,
      contexts: contextIds,
    };
  }
  // deno-lint-ignore no-explicit-any
  private stringify(result: any, fileExtension = DEFAULT_FILETYPE): string {
    return getFileFormat(fileExtension).stringify(result);
  }
  private executeGet(request: Request): Promise<Model> {
    const parts = dissectRequest(request);
    const flagValues = this.app.argv as FeatureFlags;
    Trace("Flag values:", flagValues);
    flagValues.context = parts.context || flagValues.context;
    flagValues.scope = parts.scope || flagValues.scope || this.app.env["ZZZ_SCOPE"];
    const action = new Action(flagValues, this.app.env);
    const modelId = getModelIdFromRequest(request);
    const model = { Id: modelId } as Model;
    return executeModules(this.app.modules, action, model).then(() => model).catch((error) => {
      Log("Error in executeModules:", error);
      throw error;
    });
  }
  private async executePost(request: Request): Promise<void> {
    const model = await request.json() as Model;
    const modelType = getModelTypeForNewRequest(request);
    await this.app.store.set(modelType, model);
  }
  private async executePut(request: Request): Promise<void> {
    const model = await request.json() as Model;
    const modelType = await this.app.store.getModelType(model.Id);
    await this.app.store.set(modelType, model);
  }
  private async executeDelete(request: Request): Promise<void> {
    const modelId = getModelIdFromRequest(request);
    const modelType = await this.app.store.getModelType(modelId);
    await this.app.store.remove(modelType, modelId);
  }
}

function getModelTypeForNewRequest(request: Request): string {
  const fromUrl = (new URL(request.url)).searchParams.get("type");
  if (!fromUrl || fromUrl === "request") {
    return HttpRequest.name;
  } else {
    return fromUrl;
  }
}

// deno-lint-ignore no-explicit-any
function newResponse(status: number, body: any, headers: StringToStringMap): Response {
  return new Response(body, { status, headers });
}
function getModelIdFromRequest(request: Request): string {
  const parts = dissectRequest(request);
  let result = parts.entityId;
  if (parts.extension) {
    result = parts.entityId.substring(0, parts.entityId.indexOf("."));
  }
  return result;
}
function dissectRequest(request: Request): RequestParts {
  const { searchParams, pathname } = new URL(request.url);
  const extension = extname(pathname).replace("\.", "");
  const decodedPathname = decodeURI(pathname.replace(/^\//, ""));
  const scope = request.headers?.get("x-zzz-scope") || "";
  const entityId = decodedPathname.substring(0, decodedPathname.length - extension.length).replace(/^\./, "");
  const context = searchParams.get("context") || request.headers?.get("x-zzz-context") || "";
  return {
    context,
    scope,
    entityId,
    extension,
  };
}
type RequestParts = {
  context: string;
  entityId: string;
  scope: string;
  extension: string;
};

// TODO: Tests
