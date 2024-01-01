<script setup lang="ts">
import Dropdown from "primevue/dropdown";
import { ref, toRef, toRefs, watch } from "vue";

console.log("So it begins");
const props = defineProps(["type"]);

const { type } = toRefs(props);

const methods = [
  {
    label: "No Auth",
    value: "None"
  },
  {
    label: "Basic Auth",
    value: "BasicAuth"
  },
  {
    label: "Bearer Token",
    value: "BearerToken"
  },
  {
    label: "API Key (Header)",
    value: "Header"
  },
  {
    label: "API Key (Query)",
    value: "Query"
  }
];
console.log("HERE", type);

watch(
  () => props.type,
  (newValue) => {
    console.log("authorization", newValue);
    type!.value = newValue;
  }
);
</script>

<template>
  <Dropdown
    v-model="type"
    :options="methods"
    optionLabel="label"
    optionValue="value"
    class="w-full md:w-14rem"
  />
  <div>Basic Auth: username & password</div>
  <div>Bearer Token: input field (masked?)</div>
  <div>Header: Key/Value</div>
  <div>Query: Key/Value</div>
</template>
<style scoped>
.p-dropdown {
  width: 14em;
}
</style>
