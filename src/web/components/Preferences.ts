import { createStore, withProps } from "npm:@ngneat/elf";
export { setProp } from "npm:@ngneat/elf";
import { localStorageStrategy, persistState } from "npm:@ngneat/elf-persist-state";
import { reactive } from "npm:vue";

export interface PreferencesProps {
  responsePanelLocation: "bottom" | "right";
  stylizedTitle: boolean; // Note: Web only (not desktop)
}

const Preferences = createStore(
  { name: "preferences" },
  withProps<PreferencesProps>({ responsePanelLocation: "bottom", stylizedTitle: true }),
);
export default Preferences;

persistState(Preferences, {
  key: "preferences",
  storage: localStorageStrategy,
});
