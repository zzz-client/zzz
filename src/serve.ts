const http = require("http");
const port = process.env.PORT || 8000;
import { IActor } from "./actor";
import SummaryActor from "./actors/summary";
import Letter from "./letter";
import { Load } from "./store";
import fs = require("node:fs");
import tim from "./tim";
import Act from "./actor";

const actorType = "Summary";

http.createServer((req, res) => {
    const { method, url, headers } = req;
    if (url === "/favicon.ico") {
        res.end();
        return;
    }
    const resourcePath = decodeURI(url.substring(1));
    console.log("First request", method, resourcePath);
    const what = Load(resourcePath, "Integrate");
    tim(what, what.Variables);
    Act(what, actorType).then((result) => {
        console.log(result);
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write(result);
        // res.writeHead(200, { "Content-Type": "application/json" });
        // res.write(JSON.stringify(what, null, 4));
        res.end();
    });
}).listen(port, () => {
    console.log(`App is running on port ${port}`);
});
