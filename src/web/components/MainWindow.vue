<script setup lang="ts">
import Badge from "primevue/badge";
import Dropdown from "primevue/dropdown";
import Message from "primevue/message";
import "primevue/resources/themes/arya-purple/theme.css";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { ref, watch } from "vue";
import Collections from "./Collections.vue";
import Cookies from "./Cookies.vue";
import { loadContexts } from "./MainWindow.axios";
import RequestTab from "./RequestTab.vue";
import Session, { SessionProps, setProp, Status } from "./Session";
import Skeleton from "primevue/skeleton";

const tabs = ref([]);
const activeTab = ref(0);
const context = ref(Session.getValue().context);
const contexts = ref([]);

const dirty = ref([] as boolean[]);

Session.subscribe((state) => {
  console.log("subscribe", state.tabs);
  tabs.value = state.tabs || [];
  activeTab.value = state.activeTab || 0;
  document.title = state.scope || "ᶻ 𝗓 𐰁";
});
watch(context, (newContext) => {
  Session.update(setProp("context", newContext));
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
const loadingAnimationFull = ["loadingAnimationActive", "loadingAnimationActive", "loadingAnimationActive"];
const loadingAnimationEmpty = ["loadingAnimation", "loadingAnimation", "loadingAnimation"];

const loadingAnimation = ref(loadingAnimationFull);

let loadingId = setInterval(() => {
  const loadingIndex = loadingAnimation.value.lastIndexOf("loadingAnimationActive");
  // const loadingIndex = loadingAnimation.value.findIndex((c) => c === "loadingAnimationActive");
  if (loadingIndex === loadingAnimation.value.length - 1) {
    loadingAnimation.value = [...loadingAnimationEmpty];
  } else {
    loadingAnimation.value[loadingIndex + 1] = "loadingAnimationActive";
  }
  console.log("tick", loadingIndex, loadingAnimation.value);
}, 500);

Status.connecting = true;
loadContexts()
  .then((resultContexts) => {
    clearTimeout(loadingId);
    Status.online = true;
    contexts.value = [...resultContexts];
  })
  .catch((error) => {
    clearTimeout(loadingId);
    console.log("oh no", error);
    Status.error = error.message || error;
    Status.online = false;
  })
  .then(() => (Status.connecting = false));
</script>

<template>
  <div
    v-if="!!Status.error || (!Status.online && !Status.connecting && !Status.error)"
    style="height: 100%; padding: 1em; font-size: 3em; opacity: 75%; text-align: center"
  >
    <h1 style="">(ー。ー) Zzz</h1>
    <h2>You're offline</h2>
    <div style="position: fixed; bottom: 5%; left: 50%; transform: translate(-50%, -50%)">
      <a href="https://gitlab.com/cat-dev-null/zzz" target="_blank" title="Zzz Gitlab">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 24" height="24" width="25" class="tanuki-logo" role="img" aria-hidden="true">
          <path
            fill="#E24329"
            d="m24.507 9.5-.034-.09L21.082.562a.896.896 0 0 0-1.694.091l-2.29 7.01H7.825L5.535.653a.898.898 0 0 0-1.694-.09L.451 9.411.416 9.5a6.297 6.297 0 0 0 2.09 7.278l.012.01.03.022 5.16 3.867 2.56 1.935 1.554 1.176a1.051 1.051 0 0 0 1.268 0l1.555-1.176 2.56-1.935 5.197-3.89.014-.01A6.297 6.297 0 0 0 24.507 9.5Z"
          ></path>
          <path
            fill="#FC6D26"
            d="m24.507 9.5-.034-.09a11.44 11.44 0 0 0-4.56 2.051l-7.447 5.632 4.742 3.584 5.197-3.89.014-.01A6.297 6.297 0 0 0 24.507 9.5Z"
          ></path>
          <path fill="#FCA326" d="m7.707 20.677 2.56 1.935 1.555 1.176a1.051 1.051 0 0 0 1.268 0l1.555-1.176 2.56-1.935-4.743-3.584-4.755 3.584Z"></path>
          <path
            fill="#FC6D26"
            d="M5.01 11.461a11.43 11.43 0 0 0-4.56-2.05L.416 9.5a6.297 6.297 0 0 0 2.09 7.278l.012.01.03.022 5.16 3.867 4.745-3.584-7.444-5.632Z"
          ></path>
        </svg>
      </a>
    </div>
    <Message v-if="!!Status.error" style="position: fixed; bottom: 20%; left: 50%; transform: translate(-50%, -50%)" severity="error" :closable="false">{{
      Status.error
    }}</Message>
  </div>
  <div v-if="Status.connecting" class="align-super-centered" style="text-align: center; opacity: 70%">
    <h1 style="font-size: 12em">
      <span :class="loadingAnimation[0]"> ᶻ </span>
      <span :class="loadingAnimation[1]"> 𝗓 </span>
      <span :class="loadingAnimation[2]"> 𐰁 </span>
    </h1>
  </div>
  <Skeleton v-if="Status.connecting" width="100%" height="100%" />
  <Splitter v-if="Status.online" class="absolute">
    <SplitterPanel :size="15" :minSize="20" class="absolute">
      <Collections />
    </SplitterPanel>
    <SplitterPanel :size="75" :min-size="40" class="absolute">
      <div style="position: absolute; top: 1em; right: 1em; z-index: 1000">
        <Dropdown v-model="context" :options="contexts" placeholder="Select a Context" checkmark :highlightOnSelect="true" />
      </div>
      <div v-if="tabs.length === 0" class="align-super-centered">
        <div style="font-size: 5em; opacity: 70%">ᶻ 𝗓 𐰁</div>
        Nothing to see!
        <br />
        <Button @click="newTab()" style="font-size: 0.6em">Create a new Request</Button>
      </div>
      <TabView class="absolute" @tab-click="onTabChange" v-model:activeIndex="activeTab">
        <TabPanel v-for="(tab, i) in tabs" :key="tab.id" :header="tab.title" class="absolute">
          <RequestTab v-model="tabs[i]"></RequestTab>
          <template #header>
            <Badge v-if="dirty[i]" style="margin-left: 0.5em; margin-right: 0.5em"></Badge>
            <Badge style="margin-left: 0.5em" value="x" @click="closeTab(i)"></Badge>
          </template>
        </TabPanel>
        <TabPanel v-if="tabs.length > 0" header="+" />
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
.align-super-centered {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.loadingAnimation {
  opacity: 20%;
}
.loadingAnimationActive {
  opacity: 100%;
}
</style>
