<script setup lang="ts">
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Password from "primevue/password";

import { ref, toRefs, watch } from "vue";

const props = defineProps({ method: String });

const basicAuth = ref({
  username: "",
  password: ""
});
const header = ref({
  key: "",
  value: ""
});
const query = ref({
  key: "",
  value: ""
});
const bearerToken = ref("");
const { method } = toRefs(props);
const newMethod = ref(method.value);

const methods = [
  {
    label: "No Auth",
    value: "None"
  },
  {
    label: "Basic Auth",
    value: "BasicAuth"
  },
  {
    label: "Bearer Token",
    value: "BearerToken"
  },
  {
    label: "API Key (Header)",
    value: "Header"
  },
  {
    label: "API Key (Query)",
    value: "Query"
  }
];

// console.log("method", method.value);

watch(
  () => props.method,
  (newValue) => {
    // console.log("authorization", newValue);
    method.value = newValue;
  }
);
</script>

<template>
  <div style="display: flex">
    <p class="m-0" style="width: 20em">
      <label for="method">Method</label>
      <br />
      <Dropdown inputId="method" v-model="newMethod" :options="methods" optionLabel="label" optionValue="value" />
    </p>
    <Divider layout="vertical" />
    <p v-if="'BasicAuth' === newMethod" class="m-1">
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="basicAuth.username" inputId="username" />
        <label for="username">Username</label>
      </span>
      <span class="p-float-label floating-label">
        <Password v-model="basicAuth.password" :feedback="false" inputId="password" toggleMask />
        <label for="password">Password</label>
      </span>
    </p>
    <p v-if="'BearerToken' === newMethod" class="m-1">
      <span class="p-float-label floating-label">
        <!-- TODO: this field should be way wider -->
        <Password v-model="bearerToken" :feedback="false" inputId="token" toggleMask />
        <label for="token">Token</label>
      </span>
    </p>
    <p v-if="'Header' === newMethod" class="m-1">
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="header.key" inputId="headerKey" />
        <label for="headerKey">Key</label>
      </span>
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="header.value" inputId="headerValue" />
        <label for="headerValue">Value</label>
      </span>
    </p>
    <p v-if="'Query' === newMethod" class="m-1">
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="query.key" inputId="queryKey" />
        <label for="queryKey">Key</label>
      </span>
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="query.value" inputId="queryValue" />
        <label for="queryValue">Value</label>
      </span>
    </p>
  </div>
</template>
<style scoped>
input {
  display: inline;
}

.m-0 {
  width: 100%;
}
.m-1 {
  flex: 1;
  width: 100%;
}
.pink {
  background: pink;
}

.p-dropdown {
  width: 14em;
}
.p-float-label {
  position: relative;
  display: block;
}
.floating-label {
  margin: 0.5em;
}
input {
  display: inline;
}
</style>
