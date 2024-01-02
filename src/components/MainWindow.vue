<script setup lang="ts">
import "primevue/resources/themes/arya-purple/theme.css";
import Badge from "primevue/badge";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Message from "primevue/message";
import ToggleButton from "primevue/togglebutton";
import { ref, toRef, toRefs } from "vue";
import Collections from "./Collections.vue";
import RequestTab from "./RequestTab.vue";
import axios from "axios";
import { MenuItem } from "primevue/menuitem";
const basename = (path) => path.split("/").reverse()[0];

const tabs = ref([] as { value: string }[]);
const folders = ref([] as any[]);
const dirty = ref([] as boolean[]);
const errorMessage = ref("");

let lastClick = -1;
function clickRequest(uwu) {
  const currentClick = Date.now();
  if (lastClick >= 0 && currentClick - lastClick < 500) {
    console.log(lastClick, currentClick, uwu);
    console.log("uwu", uwu.item);
    openTab(uwu.item.key);
  }
  lastClick = currentClick;
}
function openTab(key: string) {
  for (let i = 0; i < tabs.value.length; i++) {
    if (tabs.value[i].value == key) {
      activeTab.value = i;
      return;
    }
  }
  console.log("not open", key);
  tabs.value.push({ value: key });
  activeTab.value = tabs.value.length - 1;
}

let keys = [] as string[];
function addEntityToNodes(noteList, entity, parentPath = "") {
  let fullPath = parentPath + "/" + entity.Name;
  if (fullPath.substring(0, 1) == "/") {
    fullPath = fullPath.substring(1);
  }
  const newNode = {
    key: fullPath,
    label: basename(entity.Name)
  } as MenuItem;
  if (entity.Type == "Request") {
    newNode.command = clickRequest;
  }
  if (entity.Children) {
    newNode.items = [];
    entity.Children.forEach((child) => {
      addEntityToNodes(newNode.items, child, fullPath);
    });
  }
  noteList.push(newNode);
  keys.push(newNode.key!);
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
  .get(addQueryParams("http://localhost:8000"), {
    headers: {
      "X-Zzz-Workspace": ""
    }
  })
  .then((res) => {
    console.log("Got initial data", res.data);
    res.data.forEach((entity) => {
      addEntityToNodes(folders.value, entity);
    });
  })
  // .then(expandAll)
  .catch((error) => {
    console.log(error);
    console.error("ERROR", error.message, `(${error.code})`);
    console.error(error.stack);
    errorMessage.value = `An error occured: ${error.message}`;
  });

function onTabChange(event: any) {
  console.log("tab change", event);
  const tab = tabs.value[event.index];
  console.log(tab);
  if (event.index === tabs.value.length) {
    tabs.value.push({ value: "Untitled Request" });
    dirty.value[event.index] = true;
    activeTab.value = event.index;
    // document.title = `Zzz - ${basename(requestPath)}`;
  }
}
const activeTab = ref(0);
function clickBadge(tabIndex) {
  tabs.value.splice(tabIndex, 1);
}
</script>

<template>
  <Message severity="error" v-if="!!errorMessage" :closable="false">{{ errorMessage }}</Message>
  <div style="position: relative">
    <div style="float: right; position: absolute; top: 0.5em; right: 0.5em; z-index: 100">
      <ToggleButton v-model="viewSecrets" onLabel="Show secrets" offLabel="Hide secrets" />
    </div>
  </div>
  <Splitter class="absolute" v-if="!errorMessage">
    <SplitterPanel :size="15" :minSize="20" class="absolute">
      <Collections :folders="folders" />
    </SplitterPanel>
    <SplitterPanel :size="75" class="absolute">
      <TabView class="absolute" @tab-click="onTabChange" v-model:activeIndex="activeTab">
        <TabPanel v-for="(tab, i) in tabs" :key="tab.value.Name" :header="basename(tab.value)" class="absolute">
          <RequestTab :value="tab.value" :viewSecrets="viewSecrets" class="absolute"></RequestTab>
          <template #header>
            <Badge v-if="dirty[i]" style="margin-left: 0.5em; margin-right: 0.5em"></Badge>
            <Badge style="" value="x" @click="clickBadge(i)"></Badge>
          </template>
        </TabPanel>
        <TabPanel header="+" />
      </TabView>
    </SplitterPanel>
  </Splitter>
</template>

<style>
.p-tabview-panel,
.p-tabview-panels {
  width: 100%;
  height: 100%;
}
</style>
