import { createStore, withProps } from "npm:@ngneat/elf";
export { setProp } from "npm:@ngneat/elf";
import { localStorageStrategy, persistState } from "npm:@ngneat/elf-persist-state";

export interface SessionProps {
  showSecrets: boolean;
  showCookies: boolean;
  tabs: { title: string; value: string }[];
  activeTab: number;
  scope: string;
}

const Session = createStore(
  { name: "session" },
  withProps<SessionProps>({ showSecrets: false, activeTab: 0, showCookies: false, tabs: [], scope: "Salesforce Primary" }),
);
export default Session;

const persist = persistState(Session, {
  key: "session",
  storage: localStorageStrategy,
});

// Examples from https://ngneat.github.io/elf/docs/store

// Session.subscribe((state: SessionProps) => ({
//   ...state,
//   activeTab: event.index
// }));
// const user$ = authStore.pipe(select((state) => state.user));

// Session.update((state: SessionProps) => ({
//   ...state,
//   activeTab: event.index
// }));
