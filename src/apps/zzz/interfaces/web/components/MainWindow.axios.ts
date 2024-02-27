import axios from "npm:axios";
import { addModelToNodes, clickRequest, collections, errorMessage, scope, viewSecrets } from "./MainWindow.ts";

export function doTheThing(): Promise<void> {
  return axios
    .get(addQueryParams("http://localhost:8000/" + scope.value), {
      headers: {
        "X-Zzz-Context": "integrate",
      },
    })
    .then((res) => {
      console.log("Got initial data", res.data);
      res.data.Children.forEach((model) => {
        addModelToNodes(collections.value, model);
      });
    })
    .catch((error) => {
      console.log(error);
      console.error("ERROR", error.message, `(${error.code})`);
      console.error(error.stack);
      if (error.message === "Network Error") {
        error.message += ". Is the HTTP server running?";
      }
      errorMessage.value = error.response?.data || error.message;
    });
}

function addQueryParams(base: string): string {
  if (viewSecrets.value) {
    return base + "?format";
  } else {
    return base;
  }
}
