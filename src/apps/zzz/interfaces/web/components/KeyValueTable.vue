<script setup lang="ts">
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { toRef, watch } from "vue";

// interface KeyValue {
//   key: string;
//   value: string;
// }

const model = defineModel({ type: Object, default: {} });

// const what = [];
// for (const key of model) {
//   what.push(key.value);
// }
const what = Object.keys(model.value).map((key) => ({ key, value: model.value[key] }));
console.log("model", model);
console.log("what", what);

const props = defineProps<{
  readOnly?: boolean;
}>();
</script>

<template>
  <div class="uwu">
    <DataTable :value="what" :editMode="props.readOnly ? 'row' : 'cell'">
      <!-- editMode="cell"-->
      <Column key="key" field="key" header="Key">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" autofocus placeholder="Key" />
        </template>
      </Column>
      <Column key="value" field="value" header="Value" style="width: 75%">
        <template #editor="{ data, field }">
          <InputText v-model="data[field]" autofocus placeholder="Value" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.uwu {
  display: flex;
  width: 100%;
}
.p-datatable {
  flex: 1;
}
</style>
