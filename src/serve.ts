import { extname } from "path";
import Act from "./actor";
import { AppConfig } from "./request";
import { Parser, Parsers } from "./run";
import { EntityType, Get } from "./store";
import tim from "./tim";
import { error } from "console";

const http = require("http");
const HTTP_PORT = process.env.PORT || 8000;
export default function Serve(appConfig: AppConfig) {
    http.createServer((req, res) => {
        const { method, url, headers } = req;
        if (url === "/favicon.ico") {
            res.end();
            return;
        }
        const resourcePath = decodeURI(url.substring(1));
        const ext = extname(resourcePath).substring(1).toLowerCase();
        const contentType = getContentType(resourcePath);
        console.log("First request", method, resourcePath, contentType);
        Get(EntityType.Request, resourcePath, "Integrate")
            .then((letter) => {
                tim(letter, letter.Variables);
                return Act(letter, ext);
            })
            .then((result) => {
                res.writeHead(200, { "Content-Type": contentType });
                res.write(getParser(resourcePath).stringify(result));
            })
            .catch((reason) => {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.write(Parsers.TEXT.stringify(reason));
            });
    }).listen(HTTP_PORT, () => {
        console.info(`App is running on port ${HTTP_PORT}`);
    });
}
function getParser(resourcePath: string): Parser {
    const ext = extname(resourcePath).substring(1).toLowerCase();
    switch (ext) {
        case "application/json":
        default:
            return Parsers.JSON;
        case "text/plain":
            return Parsers.TEXT;
        case "text/yaml":
        case "text/yml":
            return Parsers.YAML;
    }
}
function getContentType(resourcePath: string): string {
    const ext = extname(resourcePath).substring(1).toLowerCase();
    switch (ext) {
        case "json":
        case "":
        default:
            return "application/json";
        case "yml":
        case "yaml":
        case "txt":
            return "text/plain";
    }
}
