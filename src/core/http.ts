// import { basename, extname } from "path";
import ZzzRequest, { Entity, StringToStringMap } from "./models.ts";
import { Collections, EntityType, Get, Stat, Stores } from "./storage.ts";
import { AppConfig } from "../main.ts";
import tim from "./tim.ts";
import { Act } from "./factories.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import { Parser, Parsers } from "./stores/file.ts";
import { Load } from "./variables.ts";

export interface IServer {
  getUrl(): string;
  getMethod(): string;
  getQueryParams(): URLSearchParams;
  respond(code: number, body: any, headers: StringToStringMap): any;
  http(callback: Function): void;
}

export default function Serve(appConfig: AppConfig, actorName: string = "Pass") {
  new Server().http((server: IServer) => {
    switch (server.getMethod()) {
      case "GET":
        return respond(server, actorName);
      case "POST":
        return respond(server, "Client");
      // deno-lint-ignore no-case-declarations
      case "OPTIONS":
        console.log("Responding to OPTIONS", server.getUrl());
        const headers = {
          "Allow": ["OPTIONS", "GET"],
          "Access-Control-Allow-Headers": ["X-Zzz-Workspace"],
          ...getHeaders("application/JSON"),
        };
        if (server.getUrl() !== "/") {
          headers.Allow.PUSH("POST");
        }
        return new Response(null, {
          status: 204,
          headers: headers,
        });
      default:
        throw new Error(`Unsupported method: ${server.getMethod()}`);
    }
  });
}

export class Server implements IServer {
  request: Request | null = null;
  respond(status: number, body: any, headers: StringToStringMap): Response {
    return new Response(body, { status, headers });
  }
  getUrl(): string {
    const x = new URL(this.request!.url).pathname;
    console.log("getting url from", this.request!.url, x);
    return x;
  }
  getMethod(): string {
    return this.request!.method;
  }
  getQueryParams(): URLSearchParams {
    return new URL(this.request!.url).searchParams;
  }
  http(callback: Function): void {
    const HTTP_PORT = Deno.env.get("PORT") as number | undefined || 8000;
    Deno.serve({ port: HTTP_PORT }, (request: Request): Response => {
      this.request = request;
      return callback(this);
    });
  }
}

async function respond(server: IServer, actorName: string = "Pass") {
  const url = server.getUrl();
  console.log("Responding to", url);
  if (url === "/favicon.ico") {
    return server.respond(200, {}, {});
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
  const contentType = getContentType(resourcePath);
  console.log("Received request", server.getMethod(), "base=" + base, resourcePath, contentType);

  if (base === "") {
    const whatever = await Collections();
    return server.respond(200, JSON.stringify(whatever, null, 2), getHeaders(contentType));
  }
  return Stat(base)
    .then((stats) => {
      switch (stats.Type) {
        case "Request":
          return Get(EntityType.Request, base, "integrate");
        case "Collection":
          return Get(EntityType.Collection, base, "integrate");
        case "Folder":
          return Get(EntityType.Folder, base, "integrate");
        // case "Environment":
        //   return Get(EntityType.Environment, base, "integrate");
        // case "Authorization":
        //   return Get(EntityType.Authorization, base, "integrate");
        default:
          throw new Error(`Unsupported type of entity for Stat: ${stats.Type}`);
      }
    })
    .then((result) => {
      if (result.Type === EntityType[EntityType.Request]) {
        return Load(result, "integrate", Stores.YAML); // TODO Hardcoded
      } else {
        return result;
      }
    })
    .then((result) => {
      const theRequest = result as ZzzRequest;
      theRequest.Method = server.getMethod(); // TODO: HATE THIS
      if (server.getQueryParams().has("format")) {
        tim(theRequest, theRequest.Variables);
      }
      if (ext === "curl") {
        // TODO: Hardcoded
        return Act(theRequest, "Curl");
      }
      return Act(theRequest, actorName);
    })
    .then((result) => {
      const parser = getParser(resourcePath);
      const parsedResult = parser.stringify(result);
      return server.respond(200, parsedResult, { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" });
    })
    .catch((reason) => {
      console.error(reason.message);
      console.error(reason);
      const parser = getParser(resourcePath);
      const parsedResult = parser.stringify(reason);
      console.error(parsedResult);
      return server.respond(500, parsedResult, { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" });
    });
}
function getParser(resourcePath: string): Parser {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  switch (ext) {
    case "json":
    default:
      // throw new Error("No known parser for: " + ext);
      return Parsers.JSON;
    case "yml":
    case "yaml":
      return Parsers.YAML;
    case "xml":
      return Parsers.XML;
    case "txt":
    case "curl":
      return Parsers.TEXT;
  }
}
function getHeaders(contentType: string): any {
  return { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" };
}
function getContentType(resourcePath: string): string {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  switch (ext) {
    case "json":
    case "":
      return "application/json";
    case "yml":
    case "yaml":
    case "txt":
    case "curl":
      return "text/plain";
    case "xml":
      return "text/xml";
    default:
      throw new Error('No known content type for extension "' + ext + '"');
  }
}
