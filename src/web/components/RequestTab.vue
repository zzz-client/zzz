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
import { ref, toRefs, watch, watchEffect } from "vue";
import Authorization from "./Authorization.vue";
import Body from "./Body.vue";
import KeyValueTable from "./KeyValueTable.vue";
import { executeRequest, loadRequest, saveRequest, saveNewRequest } from "./RequestTab.axios";
import Response from "./Response.vue";
const basename = (path) => path.split("/").reverse()[0];
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import Session, { Status, setProp } from "./Session";
import Preferences from "./Preferences";
import Dialog from "primevue/dialog";
import ProgressBar from "primevue/progressbar";
import { HttpRequest } from "../../core/modules/requests/mod";

const methods = ["GET", "POST", "PUT", "DELETE", "INFO"];

const tab = defineModel();
const toast = useToast();

const splitterOrientation = ref("vertical" as "horizontal" | "vertical");
const sendInitiated = ref(false);
const requestData = ref({});
const breadcrumbs = ref([]);
const newRequestName = ref("");
const response = ref({
  status: 0,
  statusText: "",
  headers: {},
  data: null
});
const showSaveAs = ref(false);

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
  sendInitiated.value = true;
  return executeRequest(tab.value.id)
    .then((executedResponse) => {
      response.value = executedResponse;
      sendInitiated.value = false;
    })
    .catch(() => {
      sendInitiated.value = false;
    });
}
function showCookies(): void {
  Session.update(setProp("showCookies", true));
}
async function save(): Promise<void> {
  console.log("Saving", JSON.stringify(requestData.value));
  const response = await saveRequest(requestData.value);
  if (response.status < 300) {
    console.log(response);
    toast.add({ summary: "Saved", severity: "success", life: 5000 });
  } else {
    console.error(response);
    toast.add({ summary: "Error", detail: response.data, severity: "error" });
  }
}
async function saveAsNew(): Promise<void> {
  const response = await saveNewRequest({
    ...requestData.value,
    Id: `${Session.getValue().scope}/${newRequestName.value}`, // TODO Support saving to any Collection
    Name: newRequestName.value
  } as HttpRequest);
  if (response.status < 300) {
    console.log(response);
    showSaveAs.value = false;
    toast.add({ summary: `Saved ${newRequestName.value}`, severity: "success", life: 5000 });
  } else {
    console.error(response);
    toast.add({ summary: "Error saving", detail: response.data, severity: "error" });
  }
}
function cancelSend(): void {
  sendInitiated.value = false;
}

watchEffect(() => {
  if (Preferences.getValue().responsePanelLocation == "right") {
    splitterOrientation.value = "horizontal";
  } else {
    splitterOrientation.value = "vertical";
  }
});

let firstLoad = true;
watch(Status, (newStatus, oldStatus) => {
  if (newStatus.online && (firstLoad || !oldStatus.online)) {
    load(tab.value.id);
  }
});
</script>

<template>
  <Toast />
  <Dialog v-model:visible="showSaveAs" modal header="Save Request" :style="{ width: '25rem' }">
    <InputText v-model="newRequestName" autocomplete="off" autofocus placeholder="Request name" />
    <div style="margin: 3em">Presently only saving to the root Collection is supported</div>
    <div style="float: right">
      <Button style="display: inline" type="button" label="Save" @click="saveAsNew"></Button>
      &nbsp;
      <Button style="display: inline" type="button" label="Cancel" severity="secondary" @click="showSaveAs = false"></Button>
    </div>
  </Dialog>

  <Splitter :layout="splitterOrientation" style="height: 100%">
    <SplitterPanel :minSize="25">
      <ProgressBar v-if="sendInitiated" mode="indeterminate" style="height: 2px"></ProgressBar>
      <Button label="Save" severity="secondary" icon="pi pi-save" @click="save" style="float: right">Save</Button>
      <Breadcrumb :model="breadcrumbs" />
      <div class="flex">
        <Dropdown v-model="requestData.Method" :options="methods" class="w-full md:w-14rem" />
        <InputText type="text" v-model="requestData.URL" />
        <Button v-if="sendInitiated" label="Cancel" @click="cancelSend" severity="secondary"> Cancel </Button>
        <Button v-if="!sendInitiated" label="Send" @click="send"> Send </Button>
      </div>
      <div class="flex">
        <TabView style="flex: 1">
          <TabPanel header="Authorization"><Authorization v-model="requestData"></Authorization></TabPanel>
          <TabPanel header="Params"><KeyValueTable v-model="requestData.QueryParams"></KeyValueTable></TabPanel>
          <TabPanel header="Headers"><KeyValueTable v-model="requestData.Headers"></KeyValueTable></TabPanel>
          <TabPanel header="Body"><Body v-model="requestData"></Body> </TabPanel>
          <TabPanel header="Settings"></TabPanel>
          <TabPanel header="Source">
            <pre>{{ requestData }}</pre>
          </TabPanel>
        </TabView>
        <a style="font-weight: bold; margin: 1em; cursor: pointer" @click="showCookies">Cookies</a>
      </div>
    </SplitterPanel>
    <SplitterPanel :minSize="25">
      <Response v-if="response.status > 0" :data="response.data"></Response>
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
.align-super-centered {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
