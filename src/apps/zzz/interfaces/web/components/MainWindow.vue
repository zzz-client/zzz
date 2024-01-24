<script setup lang="ts">
import "primevue/resources/themes/arya-purple/theme.css";
import Badge from "primevue/badge";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Message from "primevue/message";
import ToggleButton from "primevue/togglebutton";
import { ref } from "vue";
import Collections from "./Collections.vue";
import Cookies from "./Cookies.vue";
import RequestTab from "./RequestTab.vue";
import axios from "axios";
import type { MenuItem } from "primevue/menuitem";
const basename = (path) => path.split("/").reverse()[0];

const tabs = ref([] as { title: string; value: string }[]);
const collections = ref([] as any[]);
const dirty = ref([] as boolean[]);
const errorMessage = ref("");
const scope = ref("Salesforce Primary");

let lastClick = -1;
function clickRequest(uwu) {
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

window.emitter.on("set-tab-title", (result) => {
  const { Id, Name } = result;
  tabs.value.forEach((tab) => {
    if (tab.value == Id) {
      tab.title = Name;
    }
  });
});

let keys = [] as string[];
function addEntityToNodes(noteList, entity) {
  let fullPath = entity.Id;
  if (fullPath.substring(0, 1) == "/") {
    fullPath = fullPath.substring(1);
  }
  const newNode = {
    key: fullPath,
    label: entity.Name
  } as MenuItem;
  if (entity.Type == "Entity") {
    newNode.command = clickRequest;
  }
  if (entity.Children) {
    newNode.items = [];
    entity.Children.forEach((child) => {
      addEntityToNodes(newNode.items, child);
    });
  }
  noteList.push(newNode);
  keys.push(newNode.Id!);
}
const viewSecrets = ref(false);
function addQueryParams(base: string): string {
  if (viewSecrets.value) {
    return base + "?format";
  } else {
    return base;
  }
}

axios
  .get(addQueryParams("http://localhost:8000/" + scope.value), {
    headers: {
      "X-Zzz-Context": "integrate"
    }
  })
  .then((res) => {
    console.log("Got initial data", res.data);
    res.data.Children.forEach((entity) => {
      addEntityToNodes(collections.value, entity);
    });
  })
  .catch((error) => {
    console.log(error);
    console.error("ERROR", error.message, `(${error.code})`);
    console.error(error.stack);
    errorMessage.value = error.response?.data || error.message;
  });

function newTab(): void {
  tabs.value.push({ title: "Untitled Request", value: "" });
  const index = tabs.value.length - 1;
  dirty.value[index] = true;
}

function onTabChange(event: any) {
  console.log(event.originalEvent.target.textContent);
  const tab = tabs.value[event.index - 1];
  console.log("tab", tabs.value, event.index, tab);
  if (event.index === tabs.value.length && tab !== null) {
    newTab();
  }
}

function closeTab(tabIndex) {
  tabs.value.splice(tabIndex, 1);
}
</script>

<template>
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
      <TabView class="absolute" @tab-click="onTabChange">
        <TabPanel v-for="(tab, i) in tabs" :key="tab.value" :header="tab.title" class="absolute">
          <RequestTab :value="tab.value" :viewSecrets="viewSecrets" class="absolute"></RequestTab>
          <template #header>
            <Badge v-if="dirty[i]" style="margin-left: 0.5em; margin-right: 0.5em"></Badge>
            <Badge style="" value="x" @click="closeTab(i)"></Badge>
          </template>
        </TabPanel>
        <TabPanel header="+" />
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
