<script setup lang="ts">
import DataTable from "primevue/datatable";
import InputText from "primevue/inputtext";
import Column from "primevue/column";
import { ref, watch } from "vue";

const props = defineProps(["data"]);

const data = ref([]);

watch(
  () => props.data,
  (newValue) => {
    // const newParams = [] as { key: string; value: string; description: string }[];
    const newParams = [] as any;
    Object.keys(newValue).forEach((param) => {
      newParams.push({
        key: param,
        value: newValue[param]
        // description: ""
      });
    });
    data.value = newParams;
  }
);

function onCellEditComplete(change) {
  console.log("onCellEditComplete", change);
}
</script>

<template>
  <div class="uwu">
    <DataTable
      :value="data"
      editMode="cell"
      @cell-edit-complete="onCellEditComplete"
      :pt="{
        table: { style: 'min-width: 50rem' },
        column: {
          bodycell: ({ state }) => ({
            class: [{ 'pt-0 pb-0': state['d_editing'] }]
          })
        }
      }"
    >
      <Column key="key" field="key" header="Key">
        <!-- <template #editor="{ data, field }"
          ><InputText v-model="data[field]" autofocus
        /></template> -->
      </Column>
      <Column key="value" field="value" header="Value" style="width: 75%">
        <!-- <template #editor="{ data, field }"
          ><InputText v-model="data[field]" autofocus
        /></template> -->
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
