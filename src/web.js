import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import ToastService from "primevue/toastservice";

const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.mount("#app");
