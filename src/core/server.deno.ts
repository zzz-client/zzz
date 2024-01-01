import { StringToStringMap } from "./request.ts";
import { IServer } from "./serve.ts";

export default class implements IServer {
  request: Request | null = null;
  respond(status: number, body: any, headers: StringToStringMap): Response {
    return new Response(body, { status, headers });
  }
  getUrl(): string {
    return new URL(this.request!.url).pathname.substring(0);
  }
  getMethod(): string {
    return this.request!.method;
  }
  listen(responder: Function): void {
    const HTTP_PORT = Deno.env.get("PORT") as number | undefined || 8000;
    Deno.serve({ port: HTTP_PORT }, (request: Request): Response => {
      this.request = request;
      return responder(this);
    });
  }
}
