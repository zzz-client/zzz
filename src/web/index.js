import BadgeDirective from "primevue/badgedirective";
import PrimeVue from "primevue/config";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);

app.component("Toast", Toast);
// app.component("Toast", Badge);
app.directive("badge", BadgeDirective);
app.mount("#app");
