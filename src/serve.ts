// import { basename, extname } from "path";
import { StringToStringMap } from "./request.ts";
import { EntityType, Get } from "./store.ts";
import tim from "./tim.ts";
import Act from "./actor.ts";
import { extname, Parser, Parsers, Server } from "./libs.ts";
import { AppConfig } from "../main.ts";

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

function respond(server: IServer, actorName: string = "Pass") {
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
  const contentType = getContentType(resourcePath);
  console.log("Received request", method, resourcePath, contentType);
  return Get(EntityType.Request, base, "Integrate") // TODO: Hardcoded environment
    .then((theRequest) => {
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
