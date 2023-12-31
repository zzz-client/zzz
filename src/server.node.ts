import { StringToStringMap } from "./request.ts";
import { IServer } from "./serve.ts";

export default class implements IServer {
  res: any;
  constructor(res: any) {
    this.res = res;
    // Set actorName to "Client" to make it actually make the requests and yield the results!
  }
  respond(status: number, body: any, headers: StringToStringMap): void {
    this.res.writeHead(status, headers);
    this.res.write(body);
    this.res.end();
  }
  getUrl(): string {
    return this.res.url;
  }
  getMethod(): string {
    return this.res.method;
  }
  listen(responder: Function): void {
    const http = require("http"), HTTP_PORT = process.env.PORT || 8000;
    http.createServer((req, res) => {
      this.res = res;
      responder(this);
    }).listen(HTTP_PORT, () => {
      console.info(`App is running on port ${HTTP_PORT}`);
    });
  }
}
