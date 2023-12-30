import ClientActor from "./actors/client";
import CurlActor from "./actors/curl";
import SummaryActor from "./actors/summary";
import Request, { AnyNonPromise } from "./request";

export default async function Act(letter: Request, actorName: string): Promise<any> {
    const actor = newInstance(actorName);
    const result = await actor.act(letter);
    return actor.format(result);
}
export interface IActor {
    act(letter: Request): Promise<any>;
    format<T>(data: AnyNonPromise<T>): string;
}
function newInstance(type: string): IActor {
    switch (type) {
        case "Summary":
            return new SummaryActor();
        case "Curl":
        case "plain/text":
            return new CurlActor();
        case "Client":
        case "json":
            return new ClientActor();
        default:
            throw new Error(`Unknown actor type: ${type}`);
    }
}
