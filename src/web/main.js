import BadgeDirective from "primevue/badgedirective";
import PrimeVue from "primevue/config";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import FocusTrap from "primevue/focustrap";
import TextArea from "primevue/textarea";
import { createApp } from "vue";
import App from "./App.vue";

const app = createApp(App);

app.use(PrimeVue);
app.use(ToastService);

app.component("Toast", Toast);
app.component("TextArea", TextArea);
app.directive("badge", BadgeDirective);
app.directive("focustrap", FocusTrap);
app.mount("#app");
