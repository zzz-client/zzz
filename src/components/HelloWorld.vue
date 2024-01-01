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
  <div class="card flex justify-content-center" style="padding: 0.5em">
    <Splitter>
      <SplitterPanel
        class="flex align-items-center justify-content-center"
        :size="25"
        :minSize="10"
      >
        <Collections />
      </SplitterPanel>
      <SplitterPanel
        class="flex align-items-center justify-content-center"
        :size="75"
      >
        <TabView>
          <TabPanel
            v-for="tab in tabs"
            :key="tab.value"
            :header="basename(tab.value)"
          >
            <RequestTab :value="tab.value"></RequestTab>
          </TabPanel>
        </TabView>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<style scoped></style>
