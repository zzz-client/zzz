import Letter from "./letter";
import axios from "axios";

export default async function Act(letter: Letter, actorName: string): Promise<string> {
    return newInstance(actorName).act(letter);
}
interface IActor {
    act(letter: Letter): Promise<string>;
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
        case "Connect":
            return new ConnectActor();
        default:
            throw new Error(`Unknown actor type: ${type}`);
    }
}
class SummaryActor implements IActor {
    async act(letter: Letter): Promise<string> {
        return JSON.stringify(letter, null, 2);
    }
}
class CurlActor implements IActor {
    async act(letter: Letter): Promise<string> {
        let curlCommand = `curl -X ${letter.Method} ${letter.URL}?`;
        Object.keys(letter.QueryParams).forEach((key) => {
            const value = letter.QueryParams[key];
            curlCommand += `${key}=${value}&`;
        });
        curlCommand = curlCommand.substring(0, curlCommand.length - 1); // Remove either the '?' or the last '&'
        Object.keys(letter.Headers).forEach((key) => {
            const value = letter.Headers[key];
            curlCommand += ` -H "${key}: ${value}"`;
        });
        return curlCommand;
    }
}
class NodeJsActor implements IActor {
    async act(letter: Letter): Promise<string> {
        try {
            return (
                await axios.request({
                    method: letter.Method,
                    headers: letter.Headers,
                    url: letter.URL,
                    data: letter.Body
                })
            ).data;
        } catch (error) {
            console.error(error.response);
            return error.response.data;
        }
    }
}
class DenoActor implements IActor {
    async act(letter: Letter): Promise<string> {
        throw new Error("what even is");
    }
}

class ConnectActor implements IActor {
    async act(letter: Letter): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
