import axios from "npm:axios";

declare type ResponseForm = {
  contexts: string[];
  scopes: string[];
};

// TODO: Rename me
export function loadContexts(): Promise<string[]> {
  return axios
    .get("http://localhost:8000/")
    .then((res) => {
      console.log("Got contexts", res.data);
      return Promise.resolve(res.data.contexts);
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
