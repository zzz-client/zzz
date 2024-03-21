import axios from "npm:axios";
import { StringToStringMap } from "../../core/etc.ts";
import Session, { SessionProps } from "./Session.ts";
import { select } from "npm:@ngneat/elf";
import { addSecretQueryParam, getAxiosParams } from "./Utils.axios.ts";

type Response = {
  data: any;
  status: number;
  statusText: string;
  headers: StringToStringMap;
};

export function loadRequest(requestId: string): Promise<Response> {
  return axios
    .get(addSecretQueryParam("http://localhost:8000/" + requestId + ".json"), getAxiosParams())
    .then((what) => {
      return {
        data: what.data,
        status: what.status,
        success: true,
        statusText: what.statusText,
        headers: what.headers as StringToStringMap,
      };
    })
    .catch(catchError);
}
export function saveRequest(body: any): Promise<Response> {
  return axios.put("http://localhost:8000/" + body.Id, body, getAxiosParams()).then((what) => {
    return {
      data: what.data,
      status: what.status,
      statusText: what.statusText,
      success: what.status < 400,
      headers: what.headers as StringToStringMap,
    };
  })
    .catch(catchError);
}

export function saveNewRequest(body: any): Promise<Response> {
  return axios.post("http://localhost:8000/" + body.Id + "?type=request", body, getAxiosParams()).then((what) => {
    return {
      data: what.data,
      status: what.status,
      statusText: what.statusText,
      success: what.status < 400,
      headers: what.headers as StringToStringMap,
    };
  })
    .catch(catchError);
}
function catchError(error: any) {
  return {
    data: error.response.data,
    status: error.response.status,
    statusText: error.response.statusText,
    success: false,
    headers: error.response.headers as StringToStringMap,
  };
}

export function executeRequest(requestId: string): Promise<Response> {
  return axios
    .patch(
      "http://localhost:8000/" + requestId,
      {},
      getAxiosParams(),
    )
    .then((what) => {
      return {
        data: what.data,
        status: what.status,
        statusText: what.statusText,
        headers: what.headers as StringToStringMap,
      };
    })
    .catch((error) => {
      return {
        data: error.response.data,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers as StringToStringMap,
      };
    });
}
