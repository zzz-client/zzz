<script setup lang="ts">
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { ref, toRef, watch, reactive } from "vue";

interface KeyValue {
  key: string;
  value: string;
}

const props = defineProps<{
  readOnly?: boolean;
}>();

const model = defineModel({ type: Object, default: {} });

const what = ref([]);

watch(model, (newModel) => {
  const modelWhat = JSON.parse(JSON.stringify(model.value));
  console.log("KeyValue", modelWhat);
  what.value = [];
  for (const key in modelWhat) {
    console.log("Key", key, "Value", model.value[key]);
    what.value.push({
      key: key,
      value: model.value[key]
    });
  }
});
function onKeyChange(event) {
  console.log(event);
  const oldKey = event.target.placeholder;
  const newKey = event.target.value;
  const index = what.value.findIndex((item) => {
    console.log(item.key, "vs", oldKey);
    return item.key === oldKey;
  });
  if (index === -1) {
    alert("No!");
    return;
  }
  console.log("what", index, what.value[index]);
  const oldValue = what.value[index].value;
  delete model.value[oldKey];
  model.value[newKey] = oldValue;
  what.value[index].key = newKey;
  event.target.placeholder = newKey;
}
</script>

<template>
  <div class="uwu">
    <DataTable :value="what" :editMode="props.readOnly ? 'row' : 'cell'">
      <Column key="Key" field="key" header="Key">
        <template #editor="{ data, field }">
          <InputText @input="onKeyChange" :value="data.key" autofocus :placeholder="data.key || 'Key'" />
        </template>
      </Column>
      <Column key="value" field="value" header="Value" style="width: 75%">
        <template #editor="{ data, field }">
          <InputText v-model="model[data.key]" autofocus :placeholder="model[data.key] || 'Value'" />
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
