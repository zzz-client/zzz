import { createApp } from "vue";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import ToastService from "primevue/toastservice";
import Toast from "primevue/toast";
import Badge from "primevue/badge";
import BadgeDirective from "primevue/badgedirective";

const app = createApp(App);
app.use(PrimeVue);
app.use(ToastService);
app.component("Toast", Toast);
app.component("Toast", Badge);
app.directive("badge", BadgeDirective);
app.mount("#app");
