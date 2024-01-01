<script setup lang="ts">
import { ref, toRef, toRefs } from "vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Dropdown from "primevue/dropdown";
import Badge from "primevue/badge";
const props = defineProps(["data"]);

const { data } = toRefs(props);

const bodyTypes = ["Auto", "Text", "JSON", "XML", "HTML"];

const bodyType = ref(bodyTypes[0]);

const statusSeverity = ref("");

console.log("har", data.value);
if (data.value?.status >= 200 && data.value?.status < 300) {
  statusSeverity.value = "success";
}
if (data.value?.status >= 300) {
  statusSeverity.value = "warning";
}
if (data.value?.status >= 400) {
  statusSeverity.value = "danger";
}
if (data.value?.status >= 500) {
  statusSeverity.value = "danger";
}
</script>

<template>
  <a style="float: right">
    <Badge :value="data.statusText" :severity="statusSeverity"></Badge>
  </a>

  <TabView>
    <TabPanel header="Body">
      <Dropdown v-model="bodyType" :options="bodyTypes" style="min-width: 6em" />
    </TabPanel>
    <TabPanel header="Cookies">fewawef</TabPanel>
    <TabPanel header="Headers">fewawef</TabPanel>
  </TabView>
  <pre>{{ data }}</pre>
</template>

<style scoped>
div {
  color: red;
}
</style>
