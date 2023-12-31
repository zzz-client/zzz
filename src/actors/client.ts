import axios, { AxiosResponse } from "axios";
import { IActor } from "../actor";
import Request from "../request";

const defaultStringify = (data) => JSON.stringify(data, null, 2);

export default class ClientActor implements IActor {
    stringify: Function;
    constructor(stringify: Function = defaultStringify) {
        this.stringify = stringify;
    }
    async act(theRequest: Request): Promise<AxiosResponse> {
        try {
            console.log(`${theRequest.Method} ${theRequest.URL}`);
            return await doRequest(theRequest);
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
async function doRequest(theRequest: Request): Promise<any> {
    return (
        await axios.request({
            method: theRequest.Method,
            headers: theRequest.Headers,
            params: theRequest.QueryParams,
            url: theRequest.URL,
            data: theRequest.Body
        })
    ).data;
}
