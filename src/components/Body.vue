<script setup lang="ts">
import RadioButton from "primevue/radiobutton";
import { ref, toRef, toRefs, watch } from "vue";

const props = defineProps(["body"]);

const bodyType = ref("none");

const { body } = toRefs(props);

watch(
  () => props.body,
  (newValue) => {
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
      <RadioButton disabled v-model="bodyType" inputId="none" name="BodyType" value="none" />
      <label for="none" class="ml-2">none</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton disabled v-model="bodyType" inputId="form-data" name="BodyType" value="form-data" />
      <label for="form-data" class="ml-2">form-data</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton disabled v-model="bodyType" inputId="x-www-form-urlencoded" name="BodyType" value="x-www-form-urlencoded" />
      <label for="x-www-form-urlencoded" class="ml-2">x-www-form-urlencoded</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton disabled v-model="bodyType" inputId="raw" name="BodyType" value="raw" />
      <label for="raw" class="ml-2">raw</label>
    </div>
    <div class="flex align-items-center">
      <RadioButton disabled v-model="bodyType" inputId="binary" name="BodyType" value="binary" />
      <label for="binary" class="ml-2">binary</label>
    </div>
  </div>
  <div id="rawBody" v-if="bodyType == 'raw'">
    <pre>{{ body }}</pre>
  </div>
  <div id="formBody" v-if="bodyType.includes('form-')">TODO: Translate body to table-friendly form</div>
  <div id="binaryBody" v-if="bodyType == 'binary'">TODO: File selection?</div>
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
