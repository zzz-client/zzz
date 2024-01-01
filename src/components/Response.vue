<script setup lang="ts">
import { ref, toRef, toRefs, watch } from "vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Dropdown from "primevue/dropdown";
import Badge from "primevue/badge";
const props = defineProps(["data"]);

const { data } = toRefs(props);

const bodyTypes = ["Auto", "Text", "JSON", "XML", "HTML"];

const bodyType = ref(bodyTypes[0]);

const statusSeverity = ref("");

function getStatusSeverity(value: number): string {
  if (data.value?.status >= 300 && data.value?.status < 400) {
    return "warning";
  } else if (data.value?.status >= 200 && data.value?.status < 300) {
    return "success";
  } else {
    return "danger";
  }
}

watch(
  () => props.data,
  (newValue) => {
    console.log("watching", newValue);
    statusSeverity.value = getStatusSeverity(newValue);
  }
);
</script>

<template>
  <div style="position: relative">
    <a style="float: right; position: absolute; top: 0.5em; right: 0.5em">
      <Badge :severity="statusSeverity">{{ data.status }} {{ data.statusText }}</Badge>
    </a>
  </div>

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
