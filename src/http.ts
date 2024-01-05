// import { basename, extname } from "path";
import { Collection, Entity, HttpMethod, Model, ModelType, StringToStringMap } from "./core/models.ts";
import tim from "./core/tim.ts";
import { extname } from "https://deno.land/std/path/mod.ts";
import { Load } from "./core/variables.ts";
import { DefaultFlags } from "./core/flags.ts";
import { Args } from "https://deno.land/std/flags/mod.ts";
import { getContentType, getParser } from "./core/files.ts";

interface IServer {
  getUrl(): string;
  getMethod(): HttpMethod;
  getQueryParams(): URLSearchParams;
  respond(code: number, body: any, headers: StringToStringMap): any;
  http(callback: Function): void;
}

export default function Serve(argv: Args, actorName: string = "Pass") {
  new Server(argv).http((server: IServer) => {
    switch (server.getMethod()) {
      case "GET":
        return (server as Server)._respond(actorName);
      case "POST":
        console.log("Responding to POST");
        return (server as Server)._respond("Client");
      // deno-lint-ignore no-case-declarations
      case "OPTIONS":
        console.log("Responding to OPTIONS", server.getUrl());
        const headers = {
          "Allow": ["OPTIONS", "GET"],
          "Access-Control-Allow-Headers": ["X-Zzz-Workspace"],
          ...getHeaders("application/JSON"),
        };
        if (server.getUrl() !== "/") {
          headers.Allow.push("POST");
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

class Server implements IServer {
  request?: Request;
  port: number;
  constructor(argv: Args) {
    this.port = argv.http || DefaultFlags.HTTP_PORT;
  }
  respond(status: number, body: any, headers: StringToStringMap): Response {
    return new Response(body, { status, headers });
  }
  getUrl(): string {
    const x = new URL(this.request!.url).pathname;
    console.log("getting url from", this.request!.url, x);
    return x;
  }
  getMethod(): HttpMethod {
    return this.request!.method as HttpMethod;
  }
  getQueryParams(): URLSearchParams {
    return new URL(this.request!.url).searchParams;
  }
  http(callback: Function): void {
    Deno.serve({ port: this.port }, (request: Request): Response => {
      this.request = request;
      return callback(this);
    });
  }
  async _respond(actorName: string = "Pass"): Promise<Response> {
    const url = this.getUrl();
    console.log("Responding to", url);
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
    const contentType = getContentType(resourcePath);
    console.log("Received request", this.getMethod(), "base=" + base, resourcePath, contentType);

    if (base === "") {
      const whatever = await Collections();
      return this.respond(200, JSON.stringify(whatever, null, 2), getHeaders(contentType));
    }
    return Get(ModelType.Entity, base, "integrate")
      .then((result: Model) => {
        if (result.Type === "Entity") {
          return Load(result as Entity, "integrate", Stores.YAML); // TODO Hardcoded
        } else {
          return result;
        }
      })
      .then((result: Model) => {
        const theRequest = result as Entity;
        theRequest.Method = this.getMethod(); // TODO: HATE THIS
        if (this.getQueryParams().has("format") || this.getMethod() === "POST") {
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
}
function getHeaders(contentType: string): any {
  return { "Content-Type": contentType, "Access-Control-Allow-Origin": "*" };
}
async function Collections(): Promise<Collection[]> {
  const result = [] as Collection[];
  const collections = ["Salesforce Primary"];
  for (const collection of collections) {
    // result.push(await Get(ModelType.Collection, collection, "integrate")); // TODO: Hardcoded
  }
  return result;
}
