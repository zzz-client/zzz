import axios from "npm:axios";
import { StringToStringMap } from "../../../../../lib/etc.ts";
import Session, { SessionProps } from "./Session.ts";
import { select } from "npm:@ngneat/elf";

type Response = {
  data: any;
  status: number;
  statusText: string;
  headers: StringToStringMap;
};

function addQueryParams(base: string): string {
  if (Session.pipe(select((state: SessionProps) => state.showSecrets))) {
    return base + "?format";
  } else {
    return base;
  }
}
export function loadRequest(requestId: string): Promise<Response> {
  return axios
    .get(addQueryParams("http://localhost:8000/" + requestId + ".json"), {
      headers: {
        "X-Zzz-Context": "integrate",
      },
    })
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
export function saveRequest(requestId: string, body: any): Promise<Response> {
  return axios
    .put(
      "http://localhost:8000/" + requestId,
      body,
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
