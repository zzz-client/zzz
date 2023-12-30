import ClientActor from "./actors/client";
import CurlActor from "./actors/curl";
import SummaryActor from "./actors/summary";
import Request, { AnyNonPromise } from "./request";

export default async function Act(letter: Request, actorName: string): Promise<any> {
    const actor = newInstance(actorName);
    return await actor.act(letter);
}
export interface IActor {
    act(letter: Request): Promise<any>;
}
function newInstance(type: string): IActor {
    switch (type) {
        default:
        case "Client":
            return new ClientActor();
        case "Summary":
            return new SummaryActor();
        case "Curl":
            return new CurlActor();
    }
}
