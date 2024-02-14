import { ref } from "npm:vue";

export const tabs = ref([] as { title: string; value: string }[]);
export const collections = ref([] as any[]);
export const dirty = ref([] as boolean[]);
export const errorMessage = ref("");
export const scope = ref("Salesforce Primary");
export const viewSecrets = ref(false);

let lastClick = -1;
export function clickRequest(uwu: any) {
  const currentClick = Date.now();
  if (lastClick >= 0 && currentClick - lastClick < 500) {
    console.log("lastClick", lastClick, currentClick, uwu.item.key);
    openTab(uwu.item.key);
  }
  lastClick = currentClick;
}
function openTab(key: string) {
  for (let i = 0; i < tabs.value.length; i++) {
    if (tabs.value[i].value == key) {
      // activeTab.value = i;
      return;
    }
  }
  tabs.value.push({ title: "...", value: key });
  // activeTab.value = tabs.value.length - 1;
}

export function newTab(): void {
  tabs.value.push({ title: "Untitled Request", value: "" });
  const index = tabs.value.length - 1;
  dirty.value[index] = true;
}
