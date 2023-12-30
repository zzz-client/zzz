import { IActor } from "../actor";
import Letter from "../letter";

export default class CurlActor implements IActor {
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
