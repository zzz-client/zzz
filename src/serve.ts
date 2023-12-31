import { basename, extname } from "path";
import { AppConfig } from "./request";
import { Parser, Parsers } from "./run";
import { EntityType, Get } from "./store";
import tim from "./tim";
import Act from "./actor";

const http = require("http");
const HTTP_PORT = process.env.PORT || 8000;
export default function Serve(appConfig: AppConfig, actorName: string = "Pass") {
    // Set actorName to "Client" to make it actually make the requests and yield the results!
    http.createServer((req, res) => {
        const { method, url, headers } = req;
        if (url === "/favicon.ico") {
            res.end();
            return;
        }
        const resourcePath = decodeURI(url.substring(1));
        let ext = extname(resourcePath);
        if (ext.startsWith(".")) {
            ext = ext.substring(1);
        }
        const base = resourcePath.substring(0, resourcePath.length - ext.length - 1);
        const contentType = getContentType(resourcePath);
        console.log("Received request", method, resourcePath, contentType);
        Get(EntityType.Request, base, "Integrate") // TODO: Hardcoded environment
            .then((theRequest) => {
                tim(theRequest, theRequest.Variables);
                console.log(ext);
                if (ext === "curl") {
                    // TODO: Hardcoded
                    return Act(theRequest, "Curl");
                }
                return Act(theRequest, actorName);
            })
            .then((result) => {
                const parser = getParser(resourcePath);
                const parsedResult = parser.stringify(result);
                res.writeHead(200, { "Content-Type": contentType });
                res.write(parsedResult);
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
            return Parsers.JSON;
        case "yml":
        case "yaml":
            return Parsers.YAML;
        case "xml":
            return Parsers.XML;
        case "txt":
        case "curl":
            return Parsers.TEXT;
        default:
            throw new Error("No known parser for: " + ext);
    }
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
