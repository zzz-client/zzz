<script setup lang="ts">
import axios from "axios";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Breadcrumb from "primevue/breadcrumb";
import Dropdown from "primevue/dropdown";
import type { MenuItem } from "primevue/menuitem";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import KeyValueTable from "./KeyValueTable.vue";
import Authorization from "./Authorization.vue";
import Response from "./Response.vue";
import Body from "./Body.vue";
import { ref, toRefs } from "vue";
import { Entity, StringToStringMap } from "../../../core/models";
const basename = (path) => path.split("/").reverse()[0];

const props = defineProps(["value", "viewSecrets", "title"]);
const { value, viewSecrets, title } = toRefs(props);
const methods = ["GET", "POST", "PUT", "DELETE", "INFO"];
const method = ref("GET");
const requestData = ref({} as any);
const breadcrumbs = ref([] as MenuItem[]);
const authorization = ref("None");
const response = ref(
  {} as {
    status: number;
    statusText: string;
    headers: StringToStringMap;
    data: any;
  }
);

function addQueryParams(base: string): string {
  if (viewSecrets.value) {
    return base + "?format";
  } else {
    return base;
  }
}

function refreshTabTitle() {
  console.log("refresh", requestData.value);
  window.emitter.emit("set-tab-title", requestData.value as Entity);
}
async function fetchRequest(value: string): Promise<any> {
  console.log("LOL", "http://localhost:8000/" + value + ".json");
  return axios
    .get(addQueryParams("http://localhost:8000/" + value + ".json"), {
      headers: {
        "X-Zzz-Context": "integrate"
      }
    })
    .then((res) => {
      console.log("Data", res.data);
      return res.data;
    })
    .catch((error) => {
      console.log("ERROR", error.message, `(${error.code})`);
      console.log(error.response?.data);
    });
}
function doTheThing(newValue: string) {
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
  breadcrumbs.value = newBreadcrumbs;
  fetchRequest(newValue)
    .then((data) => {
      console.log("tab loaded", data);
      if (data.Type == "Entity") {
        requestData.value = data;
        refreshTabTitle();
      }
      title.value = data.Name;
      method.value = data.Method;
    })
    .catch((error) => {
      console.log("ERROR", error.message, `(${error.code})`);
      console.log(error.stack);
      return Promise.reject(error);
    });
}
function send(): void {
  console.log("Context");
  axios
    .patch(
      "http://localhost:8000/" + value.value,
      {},
      {
        headers: {
          "X-Zzz-Context": "integrate"
        }
      }
    )
    .then((what) => {
      console.log("Send response", what);
      response.value = {
        data: what.data,
        status: what.status,
        statusText: what.statusText,
        headers: what.headers as StringToStringMap
      };
    })
    .catch((error) => {
      console.error("Send error", error);
      response.value = {
        data: error.response.data,
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers as StringToStringMap
      };
    });
}

if (value) {
  doTheThing(value.value);
}
function showCookies() {
  console.log("ha");
  window.emitter.emit("show-cookies");
}
</script>

<template>
  <Splitter layout="vertical">
    <SplitterPanel :minSize="10">
      <Breadcrumb :model="breadcrumbs" />
      <div class="flex">
        <Dropdown id="qwerty" disabled v-model="method" :options="methods" class="w-full md:w-14rem" />
        <InputText id="asdf" disabled type="text" :value="requestData.URL" />
        <Button id="zxcvb" label="Send" @click="send">Send</Button>
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
