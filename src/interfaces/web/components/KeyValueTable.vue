<script setup lang="ts">
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Column from "primevue/column";
import { ref, toRef, watch } from "vue";

interface KeyValue {
  key: string;
  value: string;
}

const props = defineProps<{
  data: KeyValue[];
  readOnly?: boolean;
}>();

const data = toRef(props.data);

watch(
  () => props.data,
  (newValue) => {
    // const newParams = [] as { key: string; value: string; description: string }[];
    const newValues = [] as any;
    Object.keys(newValue).forEach((param) => {
      newValues.push({
        key: param,
        value: newValue[param]
        // description: ""
      });
    });
    data.value = newValues;
  }
);

function onCellEditComplete(change) {
  console.log("onCellEditComplete", change);
}
</script>

<template>
  <div class="uwu">
    <DataTable :value="data" :editMode="props.readOnly ? 'row' : 'cell'">
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
