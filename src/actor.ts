import Letter from "./letter";

export default function Act(letter: Letter, actorName: string): string {
    return newInstance(actorName).act(letter);
}
interface IActor {
    act(letter: Letter): string;
}
function newInstance(type: string): IActor {
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
    act(letter: Letter): string {
        return JSON.stringify(letter, null, 2);
    }
}
class CurlActor implements IActor {
    act(letter: Letter): string {
        let curlCommand = `curl -X ${letter.Method} ${letter.URL}?`;
        for (const [key, value] of letter.QueryParams) {
            curlCommand += `${key}=${value}&`;
        }
        curlCommand = curlCommand.substring(0, curlCommand.length - 1); // Remove either the '?' or the last '&'
        console.log(letter.Headers);
        for (const [key, value] of letter.Headers) {
            curlCommand += ` -H "${key}: ${value}"`;
        }
        return curlCommand;
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
