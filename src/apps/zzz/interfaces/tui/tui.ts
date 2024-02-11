// deno-lint-ignore-file
import { crayon } from "https://deno.land/x/crayon/mod.ts";
import { Canvas, Tui } from "https://deno.land/x/tui/mod.ts";
import { handleInput, handleKeyboardControls, handleMouseControls } from "https://deno.land/x/tui/mod.ts";
import { Button } from "https://deno.land/x/tui/src/components/mod.ts";
import { Computed, Signal } from "https://deno.land/x/tui/mod.ts";
import { Table } from "https://deno.land/x/tui/src/components/table.ts";

// const tui = new Tui({
//   style: crayon.bgBlack, // Make background black
//   refreshRate: 1000 / 60, // Run in 60FPS
// });

// tui.dispatch(); // Close Tui on CTRL+C

// handleInput(tui);
// handleMouseControls(tui);
// handleKeyboardControls(tui);

// const what = [
//   ["foo", "bar"],
// ];

// const collections = new Table({
//   parent: tui,
//   headers: { title: [] },
//   data: what,
//   theme: {
//     header: { base: () => "X" },
//     base: crayon.bgRed,
//     focused: crayon.bgLightRed,
//     active: crayon.bgYellow,
//   },
//   rectangle: {
//     column: 1,
//     row: 1,
//     height: 5,
//   },
// });

// tui.run();
