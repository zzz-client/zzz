import axios from "npm:axios";
import type { MenuItem } from "npm:primevue/menuitem";
import { clickRequest, REFS } from "./MainWindow.ts";
import { Model } from "../../../../../storage/mod.ts";

let keys = [] as string[];
export function doTheThing(): Promise<void> {
  return axios
    .get(addQueryParams("http://localhost:8000/" + REFS.scope.value), {
      headers: {
        "X-Zzz-Context": "integrate",
      },
    })
    .then((res) => {
      console.log("Got initial data", res.data);
      res.data.Children.forEach((model) => {
        addModelToNodes(REFS.collections.value, model);
      });
    })
    .catch((error) => {
      console.log(error);
      console.error("ERROR", error.message, `(${error.code})`);
      console.error(error.stack);
      if (error.message === "Network Error") {
        error.message += ". Is the HTTP server running?";
      }
      REFS.errorMessage.value = error.response?.data || error.message;
    });
}
function addModelToNodes(noteList, model: Model) {
  let fullPath = model.Id;
  if (fullPath.substring(0, 1) == "/") {
    fullPath = fullPath.substring(1);
  }
  const newNode = {
    key: fullPath,
    label: model.Name,
  } as MenuItem;
  if (model.Method) {
    // TODO: Could have a better way to determine this
    newNode.command = clickRequest;
  }
  if (model.Children) {
    newNode.items = [];
    model.Children.forEach((child) => {
      addModelToNodes(newNode.items, child);
    });
  }
  noteList.push(newNode);
  keys.push(newNode.Id!);
}
function addQueryParams(base: string): string {
  if (REFS.viewSecrets.value) {
    return base + "?format";
  } else {
    return base;
  }
}
