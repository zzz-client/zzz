import { AxiosError } from "npm:axios";
import Session from "./Session.ts";

export const SERVER_URL = "http://localhost:8000";

export function getAxiosParams() {
  return {
    headers: {
      "X-Zzz-Context": Session.getValue().context,
      "X-Zzz-Scope": Session.getValue().scope,
    },
  };
}
export function addSecretQueryParam(base: string): string {
  if (Session.getValue().showSecrets) {
    return base + "?format";
  } else {
    return base;
  }
}
export function handleError(error: AxiosError): Promise<unknown> {
  console.log(error);
  console.error("ERROR", error.message, `(${error.code})`);
  console.error(error.stack);
  if (error.code === "ERR_NETWORK") {
    // error.message += ". Is the HTTP server running?";
  }
  return Promise.reject(error.response?.data || error.message);
}

export type OptionsResponse = {
  contexts: string[];
  scopes: string[];
};
