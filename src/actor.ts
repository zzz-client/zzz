import Letter from "./letter";
import axios, { AxiosResponse } from "axios";

export default async function Act(letter: Letter, actorName: string): Promise<any> {
    return newInstance(actorName).act(letter);
}
interface IActor {
    act(letter: Letter): Promise<any>;
}
function newInstance(type: string): IActor {
    switch (type) {
        case "Summary":
            return new SummaryActor();
        case "Curl":
            return new CurlActor();
        case "Http":
            return new HttpActor();
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
class HttpActor implements IActor {
    async act(letter: Letter): Promise<AxiosResponse> {
        let result;
        if (letter.Trigger && letter.Trigger.Before) {
            letter.Trigger.Before();
        }
        try {
            // const fullUrl = letter.URL + convertQueryParamsToString(letter);
            // console.log(`${letter.Method} ${fullUrl}`);
            result = (
                await axios.request({
                    method: letter.Method,
                    headers: letter.Headers,
                    params: letter.QueryParams,
                    url: letter.URL,
                    data: letter.Body
                })
            ).data;
        } catch (error) {
            // console.error(error.response);
            return error.response.data;
        }
        if (letter.Trigger && letter.Trigger.After) {
            letter.Trigger.After(result);
        }
        return result;
    }
}

class ConnectActor implements IActor {
    async act(letter: Letter): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
