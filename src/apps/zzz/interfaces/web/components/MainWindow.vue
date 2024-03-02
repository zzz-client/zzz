<script setup lang="ts">
import type { MenuItem } from "npm:primevue/menuitem";
import Badge from "primevue/badge";
import Message from "primevue/message";
import "primevue/resources/themes/arya-purple/theme.css";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import ToggleButton from "primevue/togglebutton";
import { ref } from "vue";
import Collections from "./Collections.vue";
import Cookies from "./Cookies.vue";
import { doTheThing } from "./MainWindow.axios";
import RequestTab from "./RequestTab.vue";
import Session, { SessionProps, setProp } from "./Session";
import { Model } from "../../../../../storage/mod";

const viewSecrets = ref(false);
const tabs = ref([]);
const activeTab = ref(0);
const scope = ref("Salesforce Primary");
// const viewSecrets = ref(Session.getValue().showSecrets);
// const tabs = ref(Session.getValue().tabs);
// const activeTab = ref(Session.getValue().activeTab);
// const scope = ref(Session.getValue().scope);

const collections = ref([] as any[]);
const dirty = ref([] as boolean[]);
const errorMessage = ref("");

Session.subscribe((state) => {
  console.log("subscribe", state);
  tabs.value = state.tabs || [];
  activeTab.value = state.activeTab || 0;
  viewSecrets.value = state.viewSecrets || false;
  scope.value = state.scope || "Salesforce Primary";
});

// Session.update(setProp("tabs", []));

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
  INFO: "secondary"
};

let keys = [] as string[];
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
  keys.push(newNode.Id!);
}
function onTabChange(event: any) {
  // if (event.index === tabs.value.length) {
  //   newTab({ title: "Untitled Request", id: "" });
  //   return;
  // }
  // TODO
  // Session.update(setProp("activeTab", event.index));
}
function closeTab(tabIndex: number) {
  // Session.update((state: SessionProps) => ({
  //   ...state,
  //   // tabs: state.tabs.filter((tab, i) => i !== tabIndex),
  //   activeTab: state.activeTab === tabIndex ? state.activeTab - 1 : state.activeTab
  // }));
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
  for (let i = 0; i < tabs.value.length; i++) {
    if (tabs.value[i].value == key) {
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
    activeTab: tabs.length - 1
  }));
}
function closeAllTabs() {
  Session.update((state: SessionProps) => ({
    ...state,
    tabs: [],
    activeTab: 0
  }));
}

doTheThing(scope.value, (model) => {
  addModelToNodes(collections.value, model);
});
</script>

<template>
  <Button severity="secondary" style="margin: 1em; float: right; width: 6em" @click="closeAllTabs">Close All</Button>
  <div v-if="!!errorMessage" style="position: relative; padding: 2em">
    <h1>(ー。ー) Zzz</h1>
    <Message severity="error" :closable="false">{{ errorMessage }}</Message>
  </div>
  <Splitter class="absolute" v-if="!errorMessage">
    <div style="position: relative">
      <div style="float: right; position: absolute; top: 0.5em; right: 0.5em; z-index: 100">
        <ToggleButton v-model="viewSecrets" onLabel="Show secrets" offLabel="Hide secrets" />
      </div>
    </div>
    <SplitterPanel :size="15" :minSize="20" class="absolute">
      <Collections :collections="collections" />
    </SplitterPanel>

    <SplitterPanel :size="75" class="absolute">
      <TabView class="absolute" @tab-click="onTabChange" v-model:activeIndex="activeTab">
        <TabPanel v-for="(tab, i) in tabs" :key="tab.id" :header="tab.title" class="absolute">
          <RequestTab v-model="tabs[i]" class="absolute"></RequestTab>
          <template #header>
            <Badge v-if="dirty[i]" style="margin-left: 0.5em; margin-right: 0.5em"></Badge>
            <Badge style="" value="x" @click="closeTab(i)"></Badge>
          </template>
        </TabPanel>
        <TabPanel header="+" />
        <TabPanel> </TabPanel>
      </TabView>
    </SplitterPanel>
  </Splitter>
  <Cookies></Cookies>
</template>

<style>
.p-tabview-panel,
.p-tabview-panels {
  width: 100%;
  height: 100%;
}
</style>
