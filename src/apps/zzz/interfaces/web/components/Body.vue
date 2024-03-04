<script setup lang="ts">
import RadioButton from "primevue/radiobutton";
import { ref, toRefs, watch } from "vue";

const body = defineModel();
const bodyType = ref("none");

console.log("body", body.value);

watch(
  () => body.value,
  (newValue) => {
    console.log("What", newValue);
    if (newValue == null) {
      bodyType.value = "none";
      body!.value = newValue;
    } else {
      bodyType.value = "raw";
    }
  }
);
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <div class="flex align-items-center">
      <RadioButton v-model="bodyType" inputId="none" name="BodyType" value="none" />
      <label for="none" class="ml-2">none</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton v-model="bodyType" disabled inputId="form-data" name="BodyType" value="form-data" />
      <label for="form-data" class="ml-2">form-data</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton v-model="bodyType" disabled inputId="x-www-form-urlencoded" name="BodyType" value="x-www-form-urlencoded" />
      <label for="x-www-form-urlencoded" class="ml-2">x-www-form-urlencoded</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton v-model="bodyType" inputId="raw" name="BodyType" value="raw" />
      <label for="raw" class="ml-2">raw</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton v-model="bodyType" disabled inputId="binary" name="BodyType" value="binary" />
      <label for="binary" class="ml-2">binary</label>
    </div>
  </div>
  <div id="rawBody" v-if="bodyType == 'raw'">
    <pre>{{ body }}</pre>
  </div>
  <div id="formBody" v-if="bodyType.includes('form-')"></div>
  <div id="binaryBody" v-if="bodyType == 'binary'"></div>
</template>

<style scoped>
.flex {
  display: flex;
}
pre {
  border: 1px #333 solid;
  background: #222;
  padding: 0.5rem;
}
.ml-2 {
  margin-left: 0.5rem !important;
}
.align-items-center {
  align-items: center !important;
}
.gap-3 {
  gap: 1rem !important;
}
</style>
