import axios from "npm:axios";
import { addSecretQueryParam, getAxiosParams, handleError, SERVER_URL } from "./Utils.axios.ts";

export function loadCollections(): Promise<void> {
  return axios
    .get(addSecretQueryParam(SERVER_URL), getAxiosParams())
    .then((res) => {
      console.log("Got initial data", res.data);
      return Promise.resolve(res.data.Children);
    })
    .catch(handleError);
}
export function loadScopes(): Promise<void> {
  return axios
    .options(SERVER_URL)
    .then((res) => {
      console.log("Loaded", res.data);
      return Promise.resolve(res.data.scopes);
    })
    .catch(handleError);
}
