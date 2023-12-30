import ClientActor from "./actors/client";
import CurlActor from "./actors/curl";
import SummaryActor from "./actors/summary";
import Letter from "./letter";

export default async function Act(letter: Letter, actorName: string): Promise<any> {
    return newInstance(actorName).act(letter);
}
export interface IActor {
    act(letter: Letter): Promise<any>;
}
function newInstance(type: string): IActor {
    switch (type) {
        case "Summary":
            return new SummaryActor();
        case "Curl":
            return new CurlActor();
        case "Client":
            return new ClientActor();
        default:
            throw new Error(`Unknown actor type: ${type}`);
    }
}
