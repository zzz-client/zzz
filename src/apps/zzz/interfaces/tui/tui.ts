// deno-lint-ignore-file
import { crayon } from "https://deno.land/x/crayon/mod.ts";
import { Canvas, Tui as TuiMod } from "https://deno.land/x/tui/mod.ts";
import { handleInput, handleKeyboardControls, handleMouseControls } from "https://deno.land/x/tui/mod.ts";
import { Button } from "https://deno.land/x/tui/src/components/mod.ts";
import { Computed, Signal } from "https://deno.land/x/tui/mod.ts";
import { Table, TableOptions } from "https://deno.land/x/tui/src/components/table.ts";
import IApplication from "../../../mod.ts";
import { Collection } from "../../modules/requests/mod.ts";
import { Model } from "../../../../storage/mod.ts";
import { Scope } from "../../modules/scope/mod.ts";

export default async function Tui(app: IApplication): Promise<void> {
  const tui = new TuiMod({
    style: crayon.bgBlack, // Make background black
    refreshRate: 1000 / 60, // Run in 60FPS
  });
  tui.dispatch(); // Close Tui on CTRL+C
  handleInput(tui);
  handleMouseControls(tui);
  handleKeyboardControls(tui);

  const collections = {
    parent: tui,
    theme: {
      base: crayon.bgBlack.white,
      frame: { base: crayon.bgBlack },
      header: { base: crayon.bgBlack.bold.lightBlue },
      selectedRow: {
        base: crayon.bold.bgBlue.white,
        focused: crayon.bold.bgLightBlue.white,
        active: crayon.bold.bgMagenta.black,
      },
    },
    rectangle: {
      column: 1,
      row: 1,
      height: 10,
    },
    headers: [
      // { title: "ID" },
      { title: "Name" },
    ],
    data: [],
    charMap: "rounded",
    zIndex: 0,
  } as TableOptions;

  (await app.store.get(Scope.name, "Salesforce Primary")).Children.forEach((collection: Model) => {
    collections.data.push([
      // collection.Id,
      collection.Name,
    ]);
  });
  const collectionsWidget = new Table(collections);

  tui.run();
  return Promise.resolve();
}
