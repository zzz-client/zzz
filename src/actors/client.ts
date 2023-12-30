import axios, { AxiosResponse } from "axios";
import { IActor } from "../actor";
import Letter from "../letter";

export default class ClientActor implements IActor {
    async act(letter: Letter): Promise<AxiosResponse> {
        try {
            console.log(`${letter.Method} ${letter.URL}`);
            return await doRequest(letter);
        } catch (error) {
            throw formatError(error);
        }
    }
}
function formatError(error: any) {
    if (error.response && error.response.data) {
        return error.response.data;
    }
    if (error.code) {
        return new Error(error.code);
    }
    return error;
}

async function doRequest(letter: Letter): Promise<any> {
    return (
        await axios.request({
            method: letter.Method,
            headers: letter.Headers,
            params: letter.QueryParams,
            url: letter.URL,
            data: letter.Body
        })
    ).data;
}
