<script setup lang="ts">
import type { MenuItemCommandEvent } from "primevue/menuitem";
import PanelMenu from "primevue/panelmenu";
import Button from "primevue/button";
import { ref, toRefs } from "vue";
const expandedKeys = ref({} as [string: boolean]);

const props = defineProps(["collections"]);

const { collections } = toRefs(props);

export interface Domain {
  name: string;
  cookies: Cookie[];
}
export interface Cookie {
  key: string;
  value: string;
  path: string;
  expires: Date;
}

for (const collection of collections.value) {
  collection.command = (event: MenuItemCommandEvent) => {
    console.log("butts lol", event);
  };
}

function expand(items: [], value: boolean) {
  for (const item of items) {
    expandedKeys.value[item.key] = value;
    if (item.items) {
      expand(item.items, value);
    }
  }
}
function expandAll() {
  expand(collections.value, true);
}
function collapseAll() {
  expand(collections.value, false);
}
</script>
<template>
  <div class="justify-content-right" style="display: flex">
    <h1 class="logo">(ー。ー) Zzz</h1>
    <Button type="button" icon="pi pi-plus" label="Expand All" @click="expandAll">+</Button>
    <Button type="button" icon="pi pi-minus" label="Collapse All" @click="collapseAll">-</Button>
  </div>
  <PanelMenu v-model:expandedKeys="expandedKeys" :model="collections"> </PanelMenu>
</template>

<style scoped>
.logo {
  margin: 0.4em;
  flex: 1;
  text-wrap: nowrap;
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
