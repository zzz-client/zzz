<script setup lang="ts">
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import { ref, toRef, watch } from "vue";

interface KeyValue {
  key: string;
  value: string;
}

const props = defineProps<{
  readOnly?: boolean;
}>();

const model = defineModel({ type: Object, default: {} });

const what = ref([]);

watch(
  () => model.value,
  (newModel) => {
    const modelWhat = JSON.parse(JSON.stringify(model.value));
    console.log("Model", modelWhat);
    what.value = [];
    for (const key in modelWhat) {
      console.log("Key", key);
      what.value.push({
        key: key,
        value: model.value[key]
      });
    }
  }
);
</script>

<template>
  <div class="uwu">
    Model {{ model }}
    <br />
    What {{ what }}
    <DataTable v-model:data="what" :editMode="props.readOnly ? 'row' : 'cell'">
      <!-- editMode="cell"-->
      <Column key="key" field="key" header="Key">
        <template #editor="{ what, field }">
          Hello!
          <InputText v-model="model[field]" autofocus placeholder="Key" />
        </template>
      </Column>
      <Column key="value" field="value" header="Value" style="width: 75%">
        {{ value }}
        <!-- <template #editor="{ what, field }">
          <InputText v-model="model[field]" autofocus placeholder="Value" />
        </template> -->
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
