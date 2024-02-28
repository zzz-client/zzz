import { createStore, select, withProps } from "npm:@ngneat/elf";

export interface SessionProps {
  showSecrets: boolean;
  showCookies: boolean;
  tabs: { title: string; value: string }[];
  activeTab: number;
}

const Session = createStore(
  { name: "session" },
  withProps<SessionProps>({ showSecrets: false, activeTab: 0, showCookies: false, tabs: [] }),
);
export default Session;

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
