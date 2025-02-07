import { createStore, withProps } from "npm:@ngneat/elf";
export { setProp } from "npm:@ngneat/elf";
import { localStorageStrategy, persistState } from "npm:@ngneat/elf-persist-state";

export interface SessionProps {
  showSecrets: boolean;
  showCookies: boolean; // TODO: Do not need this, I think
  tabs: { title: string; value: string }[];
  activeTab: number;
  scope: string;
  context: string | null;
}

const Session = createStore(
  { name: "session" },
  withProps<SessionProps>({ showSecrets: false, activeTab: 0, showCookies: false, tabs: [], scope: "", context: null }),
);
export default Session;

persistState(Session, {
  key: "session",
  storage: localStorageStrategy,
});
