import axios from "npm:axios";
import { StringToStringMap } from "../../../../../lib/etc.ts";

type Response = {
  data: any;
  status: number;
  statusText: string;
  headers: StringToStringMap;
};

function addQueryParams(base: string, viewSecrets: boolean): string {
  if (viewSecrets) {
    return base + "?format";
  } else {
    return base;
  }
}
export function loadRequest(requestId: string, viewSecrets: boolean): Promise<Response> {
  return axios
    .get(addQueryParams("http://localhost:8000/" + requestId + ".json", viewSecrets), {
      headers: {
        "X-Zzz-Context": "integrate",
      },
    })
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

export function executeRequest(requestId: string): Promise<Response> {
  return axios
    .patch(
      "http://localhost:8000/" + requestId,
      {},
      {
        headers: {
          "X-Zzz-Context": "integrate",
        },
      },
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
