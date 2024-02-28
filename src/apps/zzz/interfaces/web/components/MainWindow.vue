<script setup lang="ts">
import Badge from "primevue/badge";
import Message from "primevue/message";
import "primevue/resources/themes/arya-purple/theme.css";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import ToggleButton from "primevue/togglebutton";
import Collections from "./Collections.vue";
import Cookies from "./Cookies.vue";
import { newTab, tabs, collections, dirty, errorMessage } from "./MainWindow";
import RequestTab from "./RequestTab.vue";
import { doTheThing } from "./MainWindow.axios";
import Session, { SessionProps } from "./Session";
import { ref } from "vue";

const viewSecrets = ref(false);
Session.subscribe((state: SessionProps) => {
  viewSecrets.value = state.showSecrets;
});

doTheThing();
function onTabChange(event: any) {
  if (event.index === tabs.value.length) {
    newTab();
    return;
  }
  Session.update((state: SessionProps) => ({
    ...state,
    activeTab: event.index
  }));
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
          <RequestTab :value="tab.value" class="absolute"></RequestTab>
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
