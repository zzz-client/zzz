import axios from "npm:axios";
import { handleError, SERVER_URL } from "./Utils.axios.ts";

export function loadContexts(): Promise<string[]> {
  return axios
    .options(SERVER_URL)
    .then((res) => {
      return Promise.resolve(res.data.contexts);
    })
    .catch(handleError);
}
