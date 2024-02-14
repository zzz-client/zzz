<script setup lang="ts">
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Accordion from "primevue/accordion";
import KeyValueTable from "./KeyValueTable.vue";
import AccordionTab from "primevue/accordiontab";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Divider from "primevue/divider";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { ref } from "vue";
import { setRefs, addDomain, addAllowedDomain } from "./Cookies";
import { Domain } from "./Collections.vue";
import { emitter } from "../../../../../lib/bus";

const visible = ref(false);
const newDomainToAllow = ref("");
const newDomain = ref("");
const domainsToAllow = ref([
  {
    name: "duckduckgo.com"
  }
] as { name: string }[]);
const domains = ref([
  {
    name: "w",
    cookies: [
      {
        key: "gimme",
        value: "moneyz",
        path: "/",
        expires: new Date()
      }
    ]
  }
] as Domain[]);
let activeDomains = ref([] as number[]);

setRefs({ visible, newDomainToAllow, newDomain, domainsToAllow, domains, activeDomains });

emitter.on("show-cookies", (isOpen) => {
  visible.value = true;
});
</script>

<template>
  <Dialog v-model:visible="visible" modal header="Cookies" :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw' }">
    <p class="mb-5">
      <InputGroup>
        <InputText type="text" v-model="newDomain" style="width: 35em" placeholder="Type a domain name" />
        <InputGroupAddon style="padding: 0"><Button label="Add domain" @click="addDomain">Add domain</Button></InputGroupAddon>
      </InputGroup>
    </p>
    <p class="mb-5">
      <Accordion :multiple="true" :activeIndex="activeDomains">
        <AccordionTab v-for="(domain, _i) in domains" :key="_i" :header="domain.name">
          <KeyValueTable v-model:data="domain.cookies"></KeyValueTable>
        </AccordionTab>
      </Accordion>
      <Divider />
      <Accordion>
        <AccordionTab header="Domains Allow List">
          <InputGroup>
            <InputText type="text" v-model="newDomainToAllow" style="width: 35em" placeholder="Type a domain name" />
            <InputGroupAddon style="padding: 0"><Button label="Add domain" @click="addAllowedDomain">Add domain</Button></InputGroupAddon>
          </InputGroup>
          <DataTable :value="domainsToAllow" editMode="cell">
            <Column field="name"></Column>
          </DataTable>
        </AccordionTab>
      </Accordion>
    </p>
  </Dialog>
</template>

<style scoped>
.p-datatable {
  flex: 1;
}
</style>
