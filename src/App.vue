<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from "./components/HelloWorld.vue";
</script>

<template>
  <HelloWorld />
</template>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  display: flex;
}
#app {
  width: 100%;
  height: 100%;
  padding: 0.5em;
}
.absolute {
  width: 100%;
  height: 100%;
  /* position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; */
}
pre {
  border: 1px #333 solid;
  background: #222;
  padding: 0.5rem;
}
</style>
