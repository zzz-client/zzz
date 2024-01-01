// import { basename, extname } from "path";
import Request, { StringToStringMap } from "./request.ts";
import { Collections, EntityType, Get, Stat } from "./store.ts";
import { extname, Parser, Parsers, Server } from "./libs.ts";
import { AppConfig } from "../main.ts";
import tim from "./tim.ts";
import Act from "./actor.ts";

export interface IServer {
  getUrl(): string;
  getMethod(): string;
  respond(code: number, body: any, headers: StringToStringMap): any;
  listen(responder: Function): void; // TODO: This responder junk is a hideous indirection of control
}

export default function Serve(appConfig: AppConfig, actorName: string = "Pass") {
  new Server().listen((server: IServer) => {
    return respond(server, actorName);
  });
}

async function respond(server: IServer, actorName: string = "Pass") {
  const method = server.getMethod();
  const url = server.getUrl();
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
  console.log("base", base);
  const contentType = getContentType(resourcePath);
  console.log("Received request", method, resourcePath, contentType);

  if (base === "") {
    const whatever = await Collections();
    return server.respond(200, JSON.stringify(whatever, null, 2), { "Content-Type": contentType });
  }
  return Stat(base)
    .then((stats) => {
      switch (stats.Type) {
        case "Request":
          return Get(EntityType.Request, base, "Integrate");
        case "Collection":
          return Get(EntityType.Collection, base, "Integrate");
        case "Folder":
          return Get(EntityType.Folder, base, "Integrate");
        // case "Environment":
        //   return Get(EntityType.Environment, base, "Integrate");
        // case "Authorization":
        //   return Get(EntityType.Authorization, base, "Integrate");
        default:
          throw new Error(`Unsupported type of entity for Stat: ${stats.Type}`);
      }
    })
    .then((result) => {
      const theRequest = result as Request;
      tim(theRequest, theRequest.Variables);
      if (ext === "curl") {
        // TODO: Hardcoded
        return Act(theRequest, "Curl");
      }
      return Act(theRequest, actorName);
    })
    .then((result) => {
      const parser = getParser(resourcePath);
      const parsedResult = parser.stringify(result);
      return server.respond(200, parsedResult, { "Content-Type": contentType });
    })
    .catch((reason) => {
      console.error(reason);
      return server.respond(500, Parsers.TEXT.stringify(reason), { "Content-Type": "text/plain" });
    });
}
function getParser(resourcePath: string): Parser {
  const ext = extname(resourcePath).substring(1).toLowerCase();
  switch (ext) {
    case "json":
    default:
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
  // throw new Error("No known parser for: " + ext);
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
