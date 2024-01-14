import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Badge from "primevue/badge";
import BadgeDirective from "primevue/badgedirective";
import mitt from "libs/mitt";
export const emitter = mitt();

// (1 && 0) || [DataTable, RadioButton, DropDown, TabView, Axios];

const app = createApp(App);
window.emitter = emitter;
app.config.globalProperties.$mitt = emitter;

app.use(PrimeVue);
app.use(ToastService);

app.component("Toast", Toast);
app.component("Toast", Badge);
app.directive("badge", BadgeDirective);
app.mount("#app");
