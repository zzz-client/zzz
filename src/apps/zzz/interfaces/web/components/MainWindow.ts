import { Ref } from "npm:vue";
export const REFS = {} as RefMap;
type RefMap = {
  [key: string]: Ref<string>;
};
export function setRef(refName: string, ref: Ref<string>) {
  REFS[refName] = ref;
}
export function setRefs(refMap: RefMap) {
  for (const key in refMap) {
    setRef(key, refMap[key]);
  }
}

// let lastClick = -1;
export function clickRequest(uwu: any) {
  //   const currentClick = Date.now();
  //   if (lastClick >= 0 && currentClick - lastClick < 500) {
  //     console.log("lastClick", lastClick, currentClick, uwu.item.key);
  //     openTab(uwu.item.key);
  //   }
  //   lastClick = currentClick;
}
// function openTab(key: string) {
//   for (let i = 0; i < REFS.tabs.value.length; i++) {
//     if (REFS.tabs.value[i].value == key) {
//       // activeTab.value = i;
//       return;
//     }
//   }
//   REFS.tabs.value.push({ title: "...", value: key });
//   // activeTab.value = tabs.value.length - 1;
// }

export function newTab(): void {
  //   REFS.tabs.value.push({ title: "Untitled Request", value: "" });
  //   const index = REFS.tabs.value.length - 1;
  //   REFS.dirty.value[index] = true;
}

import DI from "../../../../../lib/di.ts";
import { ITest, newFakeInstance } from "../test.ts";
if (!import.meta.url.startsWith("file://")) {
  DI.register("ITest", newFakeInstance);
}
const tester = DI.newInstance("ITest") as ITest;
console.log(tester);

const { describe, it, fail } = tester;

console.log("Meta", import.meta);
describe("executeModules", () => {
  it("works", async () => {
    fail("Write this test");
  });
});
