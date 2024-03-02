import axios from "npm:axios";
import Session from "./Session.ts";
import { select } from "npm:@ngneat/elf";
import { SessionProps } from "./Session.ts";

export function loadCollections(scope: string): Promise<void> {
  return axios
    .get(addQueryParams("http://localhost:8000/" + scope), {
      headers: {
        "X-Zzz-Context": "integrate",
      },
    })
    .then((res) => {
      console.log("Got initial data", res.data);
      return Promise.resolve(res.data.Children);
    })
    .catch((error) => {
      console.log(error);
      console.error("ERROR", error.message, `(${error.code})`);
      console.error(error.stack);
      if (error.message === "Network Error") {
        error.message += ". Is the HTTP server running?";
      }
      return Promise.reject(error.response?.data || error.message);
    });
}

function addQueryParams(base: string): string {
  if (Session.pipe(select((state: SessionProps) => state.showSecrets))) {
    return base + "?format";
  } else {
    return base;
  }
}
