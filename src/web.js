import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";

const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.component("Toast", Toast);
app.mount("#app");
