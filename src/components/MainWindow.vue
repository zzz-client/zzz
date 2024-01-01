<script setup lang="ts">
import "primevue/resources/themes/arya-purple/theme.css";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import TabPanel from "primevue/tabpanel";
import TabView from "primevue/tabview";
import Message from "primevue/message";
import { ref, toRef } from "vue";
import Collections from "./Collections.vue";
import RequestTab from "./RequestTab.vue";
import axios from "axios";
import { MenuItem } from "primevue/menuitem";
const basename = (path) => path.split("/").reverse()[0];

const tab1RequestPath = ref("");
const tabs = ref([
  {
    value: toRef(tab1RequestPath)
  }
]);
const folders = ref([] as any[]);
const errorMessage = ref("");

window.addEventListener("hashchange", () => {
  const requestPath = decodeURI(window.location.hash.substring(1));
  tab1RequestPath.value = requestPath;
  document.title = `Zzz - ${basename(requestPath)}`;
  console.log("#", tab1RequestPath.value);
});

function addEntityToNodes(noteList, entity, parentPath = "") {
  let fullPath = parentPath + "/" + entity.Name;
  if (fullPath.substring(0, 1) == "/") {
    fullPath = fullPath.substring(1);
  }
  const newNode = {
    key: fullPath,
    label: basename(entity.Name)
  } as MenuItem;
  if (entity.Type == "Request") {
    // newNode.type = "url"; // for Tree
    newNode.url = "#" + fullPath;
    newNode.command = () => {
      window.location.hash = newNode.url!;
    };
  }
  if (entity.Children) {
    newNode.items = [];
    entity.Children.forEach((child) => {
      addEntityToNodes(newNode.items, child, fullPath);
    });
  }
  noteList.push(newNode);
  keys.push(newNode.key!);
}

let keys = [] as string[];

axios
  .get("http://localhost:8000/")
  .then((res) => {
    console.log("Got initial data", res.data);
    res.data.forEach((entity) => {
      addEntityToNodes(folders.value, entity);
    });
  })
  // .then(expandAll)
  .catch((error) => {
    console.log(error);
    console.error("ERROR", error.message, `(${error.code})`);
    console.error(error.stack);
    errorMessage.value = `An error occured: ${error.message}`;
  });
</script>

<template>
  <Message severity="error" v-if="!!errorMessage" :closable="false">{{ errorMessage }}</Message>
  <Splitter class="absolute" v-if="!errorMessage">
    <SplitterPanel :size="15" :minSize="20" class="absolute">
      <Collections :folders="folders" />
    </SplitterPanel>
    <SplitterPanel :size="75" class="absolute">
      <TabView class="absolute">
        <TabPanel v-for="tab in tabs" :key="tab.value" :header="basename(tab.value)" class="absolute">
          <RequestTab :value="tab.value" class="absolute"></RequestTab>
        </TabPanel>
      </TabView>
    </SplitterPanel>
  </Splitter>
</template>

<style>
.p-tabview-panel,
.p-tabview-panels {
  width: 100%;
  height: 100%;
}
</style>
