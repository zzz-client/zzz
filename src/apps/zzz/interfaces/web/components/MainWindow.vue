<script setup lang="ts">
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
import { setRefs, newTab } from "./MainWindow";
import RequestTab from "./RequestTab.vue";
import { doTheThing } from "./MainWindow.axios";

const tabs = ref([] as { title: string; value: string }[]);
const collections = ref([] as any[]);
const dirty = ref([] as boolean[]);
const errorMessage = ref("");
const scope = ref("Salesforce Primary");
const viewSecrets = ref(false);

setRefs({ tabs, collections, dirty, errorMessage, scope, viewSecrets });

doTheThing();

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

window.emitter.on("set-tab-title", (result: any) => {
  const { Id, Name } = result;
  tabs.value.forEach((tab) => {
    if (tab.value == Id) {
      tab.title = Name;
    }
  });
});
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
