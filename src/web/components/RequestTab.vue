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
import { ref, toRefs } from "vue";
import Authorization from "./Authorization.vue";
import Body from "./Body.vue";
import KeyValueTable from "./KeyValueTable.vue";
import { executeRequest, loadRequest, saveRequest } from "./RequestTab.axios";
import Response from "./Response.vue";
const basename = (path) => path.split("/").reverse()[0];
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Session, { SessionProps, setProp } from "./Session";
import Dialog from "primevue/dialog";

const methods = ["GET", "POST", "PUT", "DELETE", "INFO"];

const tab = defineModel();
const toast = useToast();

const method = ref("GET");
const requestData = ref({});
const breadcrumbs = ref([]);
const authorizationType = ref("None");
const response = ref({
  status: 0,
  statusText: "",
  headers: {},
  data: null
});

function load(newValue: string) {
  if (!newValue) {
    breadcrumbs.value = [{ label: "Unsaved Request" }];
  } else {
    breadcrumbs.value = newValue.split("/").map((pathPart) => ({
      label: basename(pathPart),
      command: () => alert("Fix breadcrumbs, yo dolt")
    }));
    loadRequest(newValue).then((loadedRequest) => {
      console.log("response", loadedRequest);
      requestData.value = loadedRequest.data;
      tab.value.title = loadedRequest.data.Name;
    });
  }
}
function send(): Promise<void> {
  return executeRequest(tab.value.id).then((executedResponse) => {
    response.value = executedResponse;
  });
}
function showCookies(): void {
  Session.update(setProp("showCookies", true));
}
function save(): Promise<void> {
  console.log("Saving", JSON.stringify(requestData.value));
  return saveRequest(tab.value.id, requestData.value).then((response) => {
    if (response.status < 300) {
      console.log(response);
      toast.add({ summary: "Saved", severity: "success", life: 5000 });
    } else {
      console.error(response);
      toast.add({ summary: "Error", detail: response.data, severity: "error" });
    }
  });
}
function saveNew(): Promise<void> {
  console.log("Saving", JSON.stringify(requestData.value));
}

load(tab.value.id);
let saveNewRequest = ref(false);
</script>

<template>
  <Toast />
  <Dialog v-model:visible="saveNewRequest" modal header="Save Request" :style="{ width: '25rem' }">
    <div class="flex align-items-center gap-3 mb-3">
      <label for="name" class="font-semibold w-6rem">Request Name</label>
      <InputText id="name" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-content-end gap-2">
      <Button type="button" label="Cancel" severity="secondary" @click="saveNewRequest = false"></Button>
      <Button type="button" label="Save" @click="SaveNew"></Button>
    </div>
  </Dialog>

  <Splitter layout="vertical">
    <SplitterPanel :minSize="10">
      <Button label="Save" severity="secondary" icon="pi pi-save" @click="save" style="float: right">Save</Button>
      <Breadcrumb :model="breadcrumbs" />

      <div class="flex">
        <Dropdown v-model="requestData.Method" :options="methods" class="w-full md:w-14rem" />
        <InputText type="text" v-model="requestData.URL" />
        <Button label="Send" @click="send">Send</Button>
      </div>
      <div class="flex">
        <TabView style="flex: 1">
          <TabPanel header="Authorization">
            <Authorization v-model="requestData.Authorization"></Authorization>
          </TabPanel>
          <TabPanel header="Params"><KeyValueTable v-model="requestData.QueryParams"></KeyValueTable></TabPanel>
          <TabPanel header="Headers"><KeyValueTable v-model="requestData.Headers"></KeyValueTable></TabPanel>
          <TabPanel header="Body">
            <Body v-model="requestData"></Body>
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
      <h3>Request Data</h3>
      {{ requestData }}
      <Response v-if="response.status > 0" :data="response"></Response>
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
