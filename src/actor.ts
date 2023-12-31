import ClientActor from "./actors/client.ts";
import CurlActor from "./actors/curl.ts";
import PassThruActor from "./actors/pass.ts";
import SummaryActor from "./actors/summary.ts";
import Request from "./request.ts";

export default async function Act(theRequest: Request, actorName: string): Promise<any> {
  const actor = newInstance(actorName);
  return await actor.act(theRequest);
}
export interface IActor {
  act(theRequest: Request): Promise<any>;
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
    case "Pass":
      return new PassThruActor();
  }
}
