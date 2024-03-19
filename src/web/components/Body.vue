<script setup lang="ts">
import RadioButton from "primevue/radiobutton";
import { ref, toRefs, watch } from "vue";
import Inplace from "primevue/inplace";
import Textarea from "primevue/textarea";
import Editor from "primevue/editor";
import { HttpRequest } from "../core/modules/requests/mod.ts";

const requestData = defineModel({} as HttpRequest);
const bodyType = ref(parseBodyType());
const bodyBro = ref("");

watch(
  () => requestData.value.Body,
  () => {
    if (requestData.value.Body instanceof Object) {
      bodyBro.value = JSON.stringify(requestData.value.Body, null, 2);
    } else {
      bodyBro.value = requestData.value.Body;
    }
    bodyType.value = parseBodyType();
  }
);

function isDefault(): boolean {
  return bodyType != "form" && bodyType != "binary" && !!requestData.value.Body;
}
function parseBodyType(): string {
  console.log("Parsing body type on", requestData.value.Body);
  if (requestData.value.Body) {
    return "raw";
  } else {
    return "none";
  }
}
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
    <br />
    <Textarea v-model="requestData.Body" autoResize rows="5" cols="185" />
  </div>
  <div id="formBody" v-if="bodyType == 'form'"><!-- TODO --></div>
  <div id="binaryBody" v-if="bodyType == 'binary'"><!-- TODO --></div>
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
