import axios from "npm:axios";

export function loadContexts(): Promise<void> {
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
