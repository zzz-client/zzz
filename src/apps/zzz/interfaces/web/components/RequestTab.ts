import { ref } from "npm:vue";
import { StringToStringMap } from "../../../../../lib/etc.ts";
import type { MenuItem } from "npm:primevue/menuitem";

export const methods = ["GET", "POST", "PUT", "DELETE", "INFO"];
export const State = {} as {
  title: any;
  method: any;
  requestData: any;
  breadcrumbs: any;
  authorization: any;
  response: any;
  value: any;
  viewSecrets: any;
};

export function newInstance(props: any) {
  State.value = ref(props.value);
  State.viewSecrets = ref(props.viewSecrets);
  State.title = ref(props.title);
  State.method = ref("GET");
  State.requestData = ref({});
  State.breadcrumbs = ref([]);
  State.authorization = ref("None");
  State.response = ref({
    status: 0,
    statusText: "",
    headers: {},
    data: null,
  });
  return State;
}
