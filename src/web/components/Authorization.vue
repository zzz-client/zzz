<script setup lang="ts">
import Divider from "primevue/divider";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { HttpRequest } from "../core/modules/requests/mod.ts";

import { unref, ref, toRefs, watch, nextTick, reactive } from "vue";

const requestData = defineModel({} as HttpRequest);
let requestAuthorization;

nextTick().then(() => {
  requestAuthorization = reactive(requestData.value.Authorization);
});

function getMethodFromRequestAuthorization(requestAuthorizationValue) {
  return (requestAuthorizationValue && Object.keys(requestAuthorizationValue)[0]) || "Hmm";
}
const chosenMethod = ref("None");

const methodValues = ref({
  None: {},
  BasicAuth: {
    username: "",
    password: ""
  },
  BearerToken: "",
  Header: {
    key: "",
    value: ""
  },
  Query: {
    key: "",
    value: ""
  }
});

const methodOptions = [
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

watch(requestData, (newRequestData) => {
  console.log("watched requestData", newRequestData.Authorization);
  const newAuthMethod = getMethodFromRequestAuthorization(newRequestData.Authorization);
  console.log("newAuthMethod", newAuthMethod);
  chosenMethod.value = newAuthMethod;
  methodValues.value[newAuthMethod] = newRequestData.Authorization[newAuthMethod];
});
watch(chosenMethod, (newChosenMethod) => {
  console.log("watched chosenMethod.value", newChosenMethod, requestAuthorization);
  if (newChosenMethod === "None") {
    delete requestData.Authorization;
  } else {
    requestData.value.Authorization = {};
    requestData.value.Authorization[newChosenMethod] = methodValues.value[newChosenMethod];
  }
});
chosenMethod.value = "None";
</script>

<template>
  <div style="display: flex">
    <p class="m-0" style="width: 20em">
      <label for="method">Method</label>
      <br />
      <Dropdown inputId="method" v-model="chosenMethod" :options="methodOptions" optionLabel="label" optionValue="value" />
    </p>
    <Divider v-if="chosenMethod != 'None'" layout="vertical" />
    <p v-if="'BasicAuth' === chosenMethod" class="m-1">
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="requestData.Authorization.BasicAuth.Username" inputId="username" />
        <label for="username">Username</label>
      </span>
      <span class="p-float-label floating-label">
        <Password v-model="requestData.Authorization.BasicAuth.Password" :feedback="false" inputId="password" toggleMask />
        <label for="password">Password</label>
      </span>
    </p>
    <p v-if="'BearerToken' === chosenMethod" class="m-1">
      <span class="p-float-label floating-label">
        <!-- TODO: this field should be way wider -->
        <Password v-model="requestData.Authorization.BearerToken" :feedback="false" inputId="token" toggleMask />
        <label for="token">Token</label>
      </span>
    </p>
    <p v-if="'Header' === chosenMethod" class="m-1">
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="requestData.Authorization.Header.Key" inputId="headerKey" />
        <label for="headerKey">Key</label>
      </span>
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="requestData.Authorization.Header.Value" inputId="headerValue" />
        <label for="headerValue">Value</label>
      </span>
    </p>
    <p v-if="'Query' === chosenMethod" class="m-1">
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="requestData.Authorization.Query.key" inputId="queryKey" />
        <label for="queryKey">Key</label>
      </span>
      <span class="p-float-label floating-label" style="margin-bottom: 1.5em">
        <InputText type="text" v-model="requestData.Authorization.Query.Value" inputId="queryValue" />
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
