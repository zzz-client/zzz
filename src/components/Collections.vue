<script setup lang="ts">
import PanelMenu from "primevue/panelmenu";
import axios from "axios";
import { ref } from "vue";
const folders = ref([]).value;
const expandedKeys = ref({});
const basename = (path) => path.split("/").reverse()[0];
import { MenuItem } from "primevue/menuitem";

let keys = [] as string[];
function addEntityToNodes(noteList, entity, parentPath = "") {
  let fullPath = parentPath + "/" + entity.Name;
  if (fullPath.substring(0, 1) == "/") {
    fullPath = fullPath.substring(1);
  }
  console.log("X", fullPath, entity);
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
function expandAll() {
  // TODO: Broken since switching from Tree to PanelMenu
  for (const key of keys) {
    expandedKeys.value[key] = true;
  }
}
function collapseAll() {
  // TODO: Broken since switching from Tree to PanelMenu
  for (const key of keys) {
    expandedKeys.value[key] = true;
  }
}

axios
  .get("http://localhost:8000/")
  .then((res) => {
    res.data.forEach((entity) => {
      addEntityToNodes(folders, entity);
    });
  })
  .then(expandAll)
  .catch((error) => {
    console.error("ERROR", error.message, `(${error.code})`);
    console.error(error.stack);
    toast.add(error);
  });
</script>
<template>
  <div class="justify-content-right" style="display: flex">
    <h1 class="logo">(ー。ー) Zzz</h1>
    <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll">+</Button>
    <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll">-</Button>
  </div>
  <PanelMenu v-model:expandedKeys="expandedKeys" :model="folders"> </PanelMenu>
</template>

<style scoped>
.logo {
  margin: 0.4em;
  flex: 1;
}
button {
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  margin: 0.25em;
  line-height: 1em;
  height: 2em;
  width: 2em;
}
button:hover {
  border-color: #646cff;
}
button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>
