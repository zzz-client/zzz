<script setup lang="ts">
import Badge from "primevue/badge";
import Dropdown from "primevue/dropdown";
import Message from "primevue/message";
import "primevue/resources/themes/arya-purple/theme.css";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { ref } from "vue";
import Collections from "./Collections.vue";
import Cookies from "./Cookies.vue";
import { loadContexts } from "./MainWindow.axios";
import RequestTab from "./RequestTab.vue";
import Session, { SessionProps, setProp } from "./Session";

const tabs = ref([]);
const activeTab = ref(0);
const scope = ref(Session.getValue().scope);
const context = ref(Session.getValue().context);
const contexts = ref([]);

const dirty = ref([] as boolean[]);
const errorMessage = ref("");

Session.subscribe((state) => {
  console.log("subscribe", state.tabs);
  tabs.value = state.tabs || [];
  activeTab.value = state.activeTab || 0;
});

// In case of epic failure:
// Session.update(setProp("tabs", []));

const methodBadgeSeverities = {
  GET: "success",
  PUT: "info",
  PATCH: "warning",
  DELETE: "danger",
  INFO: "secondary"
};

function onTabChange(event: any): void {
  if (event.index === tabs.value.length) {
    if (event.index > 0) {
      newTab();
    }
    return;
  }
  Session.update(setProp("activeTab", event.index));
}
function closeTab(tabIndex: number) {
  // TODO: Broken
  const tabs = Session.getValue().tabs.filter((tab, i) => i !== tabIndex);
  console.log("!", tabs);
  Session.update((state: SessionProps) => ({
    ...state,
    tabs: tabs,
    // activeTab: state.activeTab === tabIndex ? state.activeTab - 1 : state.activeTab
    activeTab: 1
  }));
}
function closeAllTabs() {
  Session.update((state: SessionProps) => ({
    ...state,
    tabs: [],
    activeTab: 0
  }));
}
function newTab(tab: Tab = { title: "Untitled Request", id: "" }): void {
  console.log(tab);
  Session.update((state: SessionProps) => ({
    ...state,
    tabs: [...state.tabs, tab],
    activeTab: state.tabs.length
  }));
}

loadContexts().then((resultContexts) => {
  contexts.value = [];
  resultContexts.forEach((resultContext) => {
    contexts.value.push(resultContext);
  });
});
</script>

<template>
  <div v-if="!!errorMessage" style="position: relative; padding: 2em">
    <h1>(ー。ー) Zzz</h1>
    <Message severity="error" :closable="false">{{ errorMessage }}</Message>
  </div>
  <Splitter class="absolute" v-if="!errorMessage">
    <SplitterPanel :size="15" :minSize="20" class="absolute">
      <Collections />
    </SplitterPanel>

    <SplitterPanel :size="75" min-size="40" class="absolute">
      <div style="position: absolute; top: 1em; right: 1em">
        <Dropdown v-model="context" :options="contexts" placeholder="Select a Context" checkmark :highlightOnSelect="true" />
      </div>
      <div v-if="tabs.length === 0" class="absolute" style="font-size: 1.5em; position: relative; left: 40%; top: 40%; margin: auto">
        Nothing to see!
        <br />
        <Button @click="newTab()" style="font-size: 0.6em">Create a new Request</Button>
      </div>
      <TabView class="absolute" @tab-click="onTabChange" v-model:activeIndex="activeTab">
        <TabPanel v-for="(tab, i) in tabs" :key="tab.id" :header="tab.title" class="absolute">
          <RequestTab v-model="tabs[i]" class="absolute"></RequestTab>
          <template #header>
            <Badge v-if="dirty[i]" style="margin-left: 0.5em; margin-right: 0.5em"></Badge>
            <Badge style="margin-left: 0.5em" value="x" @click="closeTab(i)"></Badge>
          </template>
        </TabPanel>
        <TabPanel v-if="tabs.length > 0" header="+" />
      </TabView>
    </SplitterPanel>
  </Splitter>
  <Button severity="secondary" v-if="tabs.length > 0" style="position: absolute; right: 1em; top: 1em; width: 6em" @click="closeAllTabs">Close All</Button>
  <Cookies></Cookies>
</template>

<style>
.p-tabview-panel,
.p-tabview-panels {
  width: 100%;
  height: 100%;
}
</style>
