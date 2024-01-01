<script setup lang="ts">
import "primevue/resources/themes/arya-purple/theme.css";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { ref, toRef } from "vue";
import Collections from "./Collections.vue";
import RequestTab from "./RequestTab.vue";
const basename = (path) => path.split("/").reverse()[0];

const tab1RequestPath = ref("");
const tabs = ref([
  {
    value: toRef(tab1RequestPath)
  }
]);

window.addEventListener("hashchange", () => {
  const requestPath = decodeURI(window.location.hash.substring(1));
  tab1RequestPath.value = requestPath;
  console.log("#", tab1RequestPath.value);
});
</script>

<template>
  <Splitter class="absolute">
    <SplitterPanel :size="15" :minSize="20" class="absolute">
      <Collections />
    </SplitterPanel>
    <SplitterPanel :size="75" class="absolute">
      <TabView class="absolute">
        <TabPanel v-for="tab in tabs" :key="tab.value" :header="basename(tab.value)" class="absolute">
          <RequestTab :value="tab.value" class="absolute"></RequestTab>
        </TabPanel>
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
