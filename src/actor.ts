import Letter from "./letter";

export default function Act(letter: Letter, actorName: string): void {
    const result = newInstance(actorName).act(letter);
    if(result){
        console.log(result);
    }
}
interface IActor {
    act(letter: Letter): string | null
}
function newInstance(type: string): IActor{
    switch (type) {
        case "Summary":
            return new SummaryActor();
        case "Curl":
            return new CurlActor();
        case "Node":
            return new NodeJsActor();
        case "Deno":
            return new DenoActor();
        default:
            throw new Error(`Unknown actor type: ${type}`);
    }
}
class SummaryActor implements IActor {
    act(letter: Letter): null {
        console.log(JSON.stringify(letter, null, 2));
        return null;
    }
}
class CurlActor implements IActor {
    act(letter: Letter): string {
        throw new Error('curl -X ' + letter.method + ' ' + letter.url + ' ' + letter.headers + '...');
    }
}
class NodeJsActor implements IActor {
    act(letter: Letter): string {
        throw new Error("Method not implemented.");
    }
}
class DenoActor implements IActor {
    act(letter: Letter): string {
        throw new Error("Method not implemented.");
    }
}

