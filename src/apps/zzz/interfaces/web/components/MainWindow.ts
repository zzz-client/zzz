import { ref } from "npm:vue";
import { Model } from "../../../../../storage/mod.ts";

export const tabs = ref([] as { title: string; value: string }[]);
export const collections = ref([] as any[]);
export const dirty = ref([] as boolean[]);
export const errorMessage = ref("");
export const scope = ref("Salesforce Primary");
import type { MenuItem } from "npm:primevue/menuitem";

let lastClick = -1;
export function clickRequest(uwu: any) {
  const currentClick = Date.now();
  if (lastClick >= 0 && currentClick - lastClick < 500) {
    console.log("lastClick", lastClick, currentClick, uwu.item.key);
    openTab(uwu.item.key);
  }
  lastClick = currentClick;
}
function openTab(key: string) {
  for (let i = 0; i < tabs.value.length; i++) {
    if (tabs.value[i].value == key) {
      // activeTab.value = i;
      return;
    }
  }
  tabs.value.push({ title: "...", value: key });
  // activeTab.value = tabs.value.length - 1;
}

export function newTab(): void {
  tabs.value.push({ title: "Untitled Request", value: "" });
  const index = tabs.value.length - 1;
  dirty.value[index] = true;
}

interface Collection {
  key: string;
  label: string;
  command: (event: any) => void;
  items?: MenuItem[];
}

const methodBadgeSeverities = {
  GET: "success",
  PUT: "info",
  PATCH: "warning",
  DELETE: "danger",
  INFO: "secondary",
};

let keys = [] as string[];
export function addModelToNodes(collectionList: any[], model: Model) {
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
  collectionList.push(newNode);
  keys.push(newNode.Id!);
}
