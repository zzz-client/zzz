<script setup lang="ts">
import type { MenuItemCommandEvent } from "primevue/menuitem";
import PanelMenu from "primevue/panelmenu";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import Session, { SessionProps, setProp } from "./Session";
import { loadCollections, loadScopes } from "./Collections.axios";

import { ref, toRefs } from "vue";
const expandedKeys = ref({} as [string: boolean]);
const collections = ref([] as any[]);

const scopes = ref([]);
const scope = ref(Session.getValue().scope);
const viewSecrets = ref(Session.getValue().viewSecrets);

Session.subscribe((state) => {
  scope.value = state.scope;
  viewSecrets.value = state.viewSecrets;
});

function expand(items: [], value: boolean) {
  for (const item of items) {
    expandedKeys.value[item.key] = value;
    if (item.items) {
      expand(item.items, value);
    }
  }
}
function expandAll() {
  expand(collections.value, true);
}
function collapseAll() {
  expand(collections.value, false);
}
let lastClick = -1;
function clickRequest(uwu: any) {
  const currentClick = Date.now();
  if (lastClick >= 0 && currentClick - lastClick < 500) {
    console.log("lastClick", lastClick, currentClick, uwu.item.key);
    openTab(uwu.item.key);
  }
  lastClick = currentClick;
}
function openTab(key: string) {
  const tabs = Session.getValue().tabs;
  console.log("Yeet", key, tabs);
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].value == key) {
      Session.update(setProp("activeTab", i));
      activeTab.value = i;
      return;
    }
  }
  newTab({ title: "...", id: key });
}
function newTab(tab: Tab): void {
  Session.update((state: SessionProps) => ({
    ...state,
    tabs: [...state.tabs, tab],
    activeTab: state.tabs.length
  }));
}
function addModelToNodes(collectionList: any[], model: Model) {
  let fullPath = model.Id;
  if (fullPath.substring(0, 1) == "/") {
    fullPath = fullPath.substring(1);
  }
  const newNode = {
    key: fullPath,
    label: model.Name
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
}
interface Collection {
  key: string;
  label: string;
  command: (event: any) => void;
  items?: MenuItem[];
}
export interface Cookie {
  key: string;
  value: string;
  path: string;
  expires: Date;
}

loadCollections(scope.value).then((models) => {
  models.forEach((model) => addModelToNodes(collections.value, model));
});
loadScopes().then((resultScopes) => {
  resultScopes.forEach((resultScope) => {
    scopes.value.push(resultScope);
  });
});
</script>
<template>
  <div class="justify-content-right" style="display: flex">
    <h1 class="logo">(ー。ー) Zzz</h1>
    <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll">+</Button>
    <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll">-</Button>
  </div>
  <PanelMenu v-model:expandedKeys="expandedKeys" :model="collections"> </PanelMenu>
  <div style="position: absolute; bottom: 1em; left: 1em">
    <ToggleButton v-model="viewSecrets" onLabel="Show secrets" offLabel="Hide secrets" />
    <Dropdown v-model="scope" :options="scopes" placeholder="Select a Scope" checkmark :highlightOnSelect="false" />
  </div>
</template>

<style scoped>
.logo {
  margin: 0.4em;
  flex: 1;
  text-wrap: nowrap;
}
button {
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  margin: 0.25em;
  line-height: 1em;
  height: 2em;
  width: 2em;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
