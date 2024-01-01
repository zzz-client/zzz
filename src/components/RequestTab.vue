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
import ZzzRequest, { ZzzResponse, StringToStringMap } from "../core/request";
const basename = (path) => path.split("/").reverse()[0];

const props = defineProps(["value"]);
const { value } = toRefs(props);
const methods = ["GET", "POST", "PUT", "DELETE", "INFO"];
const method = ref("GET");
const requestData = ref({} as any);
const breadcrumbs = ref([] as MenuItem[]);
const authorization = ref("None");
const response = ref({} as ZzzResponse);

async function fetchRequest(value: string): Promise<any> {
  return axios
    .get("http://localhost:8000/" + value)
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
      url: "#" + href
    });
  }
  breadcrumbs.value = newBreadcrumbs;
  fetchRequest(newValue)
    .then((data) => {
      console.log("tab loaded request", data);
      if (data.Type == "Request") {
        requestData.value = data;
      }
      method.value = data.Method;
    })
    .catch((error) => {
      console.log("ERROR", error.message, `(${error.code})`);
      console.log(error.stack);
    });
}
async function send() {
  // const what = (await axios({method: requestData.value.Method, headers: requestData.value.Headers, params: requestData.value.QueryParams, url: requestData.value.URL, data: requestData.value.Body})).data;
  axios
    .post("http://localhost:8000/" + value.value + ".json")
    .then((what) => {
      response.value = {
        data: what.data,
        status: what.status,
        statusText: what.statusText,
        headers: what.headers as StringToStringMap
      };
      console.log("WHAT", response);
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
        <InputText id="asdf" disabled type="text" :value="(requestData as any).URL" />
        <Button id="zxcvb" label="Send" @click="send">Send</Button>
      </div>
      <TabView>
        <TabPanel header="Params"><KeyValueTable :data="requestData.QueryParams"></KeyValueTable></TabPanel>
        <TabPanel header="Authorization">
          <Authorization :type="authorization"></Authorization>
        </TabPanel>
        <TabPanel header="Headers"><KeyValueTable :data="requestData.Headers"></KeyValueTable></TabPanel>
        <TabPanel header="Body">
          <Body :body="requestData.Body"></Body>
        </TabPanel>
        <TabPanel header="Settings"></TabPanel>
        <TabPanel header="Source">
          <pre>{{ requestData }}</pre>
        </TabPanel>
      </TabView>
    </SplitterPanel>
    <SplitterPanel :minSize="10">
      <Response :data="response"></Response>
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
