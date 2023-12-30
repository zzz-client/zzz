import axios, { AxiosResponse } from "axios";
import { IActor } from "../actor";
import Letter from "../letter";

export default class ClientActor implements IActor {
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
