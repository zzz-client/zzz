import Act from "./actor";
import { AppConfig } from "./request";
import { EntityType, Get } from "./store";
import tim from "./tim";

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
        console.log("First request", method, resourcePath);
        Get(EntityType.Request, resourcePath, "Integrate")
            .then((letter) => {
                tim(letter, letter.Variables);
                return Act(letter, appConfig.actor);
            })
            .then((result) => {
                res.writeHead(200, { "Content-Type": "text/plain" }); // TODO: How to have this set from Actor? Maybe add to IActor interface?
                res.write(result);
                // res.writeHead(200, { "Content-Type": "application/json" });
                // res.write(JSON.stringify(what, null, 4));
                res.end();
            });
    }).listen(HTTP_PORT, () => {
        console.info(`App is running on port ${HTTP_PORT}`);
    });
}
