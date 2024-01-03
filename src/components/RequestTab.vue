<script setup lang="ts">
import axios from "axios";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Breadcrumb from "primevue/breadcrumb";
import Dropdown from "primevue/dropdown";
import { MenuItem } from "primevue/menuitem";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import KeyValueTable from "./KeyValueTable.vue";
import Authorization from "./Authorization.vue";
import Response from "./Response.vue";
import Body from "./Body.vue";
import { ref, toRef, toRefs } from "vue";
import ZzzRequest, { ZzzResponse, StringToStringMap } from "../core/models";
const basename = (path) => path.split("/").reverse()[0];

const props = defineProps(["value", "viewSecrets", "title"]);
const { value, viewSecrets, title } = toRefs(props);
const methods = ["GET", "POST", "PUT", "DELETE", "INFO"];
const method = ref("GET");
const requestData = ref({} as any);
const breadcrumbs = ref([] as MenuItem[]);
const authorization = ref("None");
const response = ref({} as ZzzResponse);

function addQueryParams(base: string): string {
  if (viewSecrets.value) {
    return base + "?format";
  } else {
    return base;
  }
}

async function fetchRequest(value: string): Promise<any> {
  return axios
    .get(addQueryParams("http://localhost:8000/" + value))
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log("ERROR", error.message, `(${error.code})`);
      console.log(error.stack);
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
      if (data.Type == "Request") {
        requestData.value = data;
      }
      title.value = data.Name;
      method.value = data.Method;
    })
    .catch((error) => {
      console.log("ERROR", error.message, `(${error.code})`);
      console.log(error.stack);
    });
}
function send(): void {
  // const what = (await axios({method: requestData.value.Method, headers: requestData.value.Headers, params: requestData.value.QueryParams, url: requestData.value.URL, data: requestData.value.Body})).data;
  axios
    .get(addQueryParams("http://localhost:8000/" + value.value))
    .then((what) => {
      response.value = {
        data: what.data,
        status: what.status,
        statusText: what.statusText,
        headers: what.headers as StringToStringMap
      };
    })
    .catch((error) => {
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
        <a style="font-weight: bold; margin: 1em; cursor: pointer" v-on:click="emitter.emit('show-cookies')">Cookies</a>
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
