<script setup lang="ts">
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import type { MenuItem } from "primevue/menuitem";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import { emitter } from "../../../../../lib/bus";
import { Model } from "../../../../../storage/mod";
import Authorization from "./Authorization.vue";
import Body from "./Body.vue";
import KeyValueTable from "./KeyValueTable.vue";
import { methods, newInstance } from "./RequestTab";
import { executeRequest, loadRequest } from "./RequestTab.axios";
import Response from "./Response.vue";
const basename = (path) => path.split("/").reverse()[0];
const props = defineProps(["value", "viewSecrets", "title"]);

const State = newInstance(props);

function refreshTabTitle() {
  emitter.emit("set-tab-title", State.requestData.value as Model);
}
function load(newValue: string) {
  const newBreadcrumbs = [] as MenuItem[];
  let href = "";
  for (const pathPart of newValue.split("/")) {
    href += "/" + pathPart;
    if (href.startsWith("/")) {
      href = href.substring(1);
    }
    newBreadcrumbs.push({
      label: basename(pathPart),
      command: () => alert("Fix breadcrumbs, yo dolt")
    });
  }
  State.breadcrumbs.value = newBreadcrumbs;
  loadRequest(newValue).then((loadedRequest) => {
    console.log("loaded", loadedRequest);
    State.requestData.value = loadedRequest.data;
    refreshTabTitle();
  });
}
function send(): void {
  //   executeRequest(State.value.value).then((executedResponse) => {
  //     State.response.value = executedResponse;
  //   });
}

if (State.value) {
  load(State.value.value);
}
function showCookies() {
  console.log("ha");
  emitter.emit("show-cookies");
}

const method = State.method;
const requestData = State.requestData;
const breadcrumbs = State.breadcrumbs;
const authorization = State.authorization;
const response = State.response;
</script>

<template>
  <Splitter layout="vertical">
    <SplitterPanel :minSize="10">
      <Button label="Save" severity="secondary" icon="pi pi-save" @click="save" style="float: right">Save</Button>
      <Breadcrumb :model="breadcrumbs" />

      <div class="flex">
        <Dropdown disabled v-model="method" :options="methods" class="w-full md:w-14rem" />
        <InputText disabled type="text" :value="requestData.URL" />
        <Button label="Send" @click="send">Send</Button>
      </div>
      <div class="flex">
        <TabView style="flex: 1">
          <TabPanel header="Authorization">
            <Authorization :method="authorization"></Authorization>
          </TabPanel>
          <TabPanel header="Params"><KeyValueTable :data="requestData.QueryParams"></KeyValueTable></TabPanel>
          <TabPanel header="Headers"><KeyValueTable :data="requestData.Headers"></KeyValueTable></TabPanel>
          <TabPanel header="Body">
            <Body :body="requestData.Body"></Body>
          </TabPanel>
          <TabPanel header="Settings"></TabPanel>
          <TabPanel header="Source">
            <pre>{{ requestData }}</pre>
          </TabPanel>
        </TabView>
        <a style="font-weight: bold; margin: 1em; cursor: pointer" @click="showCookies">Cookies</a>
      </div>
    </SplitterPanel>
    <SplitterPanel :minSize="10">
      <Response :v-if="response != {}" :data="response"></Response>
    </SplitterPanel>
  </Splitter>
</template>

<style scoped>
.flex {
  display: flex;
  flex-direction: row;
}
pre {
  border: 1px #333 solid;
  background: #222;
  padding: 0.5rem;
}
#asdf {
  width: 7em;
}
button {
  width: 5em;
  display: flex;
}
input {
  display: flex;
  flex: 1;
}
</style>
