<script setup lang="ts">
import { MenuItem, MenuItemCommandEvent } from "primevue/menuitem";
import PanelMenu from "primevue/panelmenu";
import { ref, toRefs, watch } from "vue";
const expandedKeys = ref({});

const props = defineProps(["folders"]);

const { folders } = toRefs(props);

for (const folder of folders.value) {
  folder.command = (event: MenuItemCommandEvent) => {
    console.log("butts lol", event);
  };
  folder.url = null;
}

function collapseAll() {
  // for (const key of keys) {
  //   expandedKeys.value[key] = true;
  // }
}
function expandAll() {
  //   for (const key of keys) {
  //     expandedKeys.value[key] = true;
  //   }
  // }
}
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
