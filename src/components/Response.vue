<script setup lang="ts">
import { ref, toRef, toRefs } from "vue";
const props = defineProps(["data"]);

const { data } = toRefs(props);
</script>

<template>
  <pre>{{ data }}</pre>
</template>

<style scoped>
div {
  color: red;
}
</style>
