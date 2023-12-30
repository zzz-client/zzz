import { basename, extname } from "path";
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
        const base = resourcePath.substring(0, resourcePath.length - extname(resourcePath).length);
        const contentType = getContentType(resourcePath);
        console.log("First request", method, resourcePath, contentType);
        Get(EntityType.Request, base, "Integrate") // TODO: Hardcoded environment
            .then((letter) => {
                tim(letter, letter.Variables);
                return Act(letter, appConfig.actor);
            })
            .then((result) => {
                res.writeHead(200, { "Content-Type": contentType });
                res.write(getParser(resourcePath).stringify(result));
            })
            .catch((reason) => {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.write(Parsers.TEXT.stringify(reason));
            })
            .finally(() => res.end());
    }).listen(HTTP_PORT, () => {
        console.info(`App is running on port ${HTTP_PORT}`);
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
        case "txt":
            return Parsers.TEXT;
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
