import { Ref } from "npm:vue";
import { Cookies } from "../../../modules/cookies/mod.ts";
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

export function addDomain() {
  try {
    for (let i = 0; i < REFS.domains.value.length; i++) {
      if (REFS.domains.value[i].name == REFS.newDomain.value) {
        throw new Error("Domain already in list " + REFS.activeDomains.value);
      }
    }
    REFS.domains.value.push({
      name: REFS.newDomain.value,
      cookies: [] as Cookies[],
    });
    REFS.newDomain.value = "";
  } catch (error) {
    console.error(error);
  }
}
export function addAllowedDomain() {
  try {
    for (let i = 0; i < REFS.domainsToAllow.value.length; i++) {
      if (REFS.domainsToAllow.value[i].name == REFS.newDomainToAllow.value) {
        throw new Error("Domain already in list");
      }
    }
    REFS.domainsToAllow.value.push({
      name: REFS.newDomainToAllow.value,
    });
    REFS.newDomainToAllow.value = "";
  } catch (error) {
    console.error(error);
  }
}
