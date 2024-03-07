// deno-lint-ignore-file
import { crayon } from "https://deno.land/x/crayon/mod.ts";
import { Canvas, Tui as TuiMod } from "https://deno.land/x/tui/mod.ts";
import { handleInput, handleKeyboardControls, handleMouseControls } from "https://deno.land/x/tui/mod.ts";
import { Button, ComboBox, ComboBoxOptions, Frame, FrameOptions, Input, InputOptions, Label, LabelOptions, Table, TableOptions, Text, TextBox, TextOptions } from "https://deno.land/x/tui/src/components/mod.ts";
import { Computed, Signal } from "https://deno.land/x/tui/mod.ts";
import IApplication from "../../../mod.ts";
import { Collection, HttpRequest } from "../../modules/requests/mod.ts";
import { Model } from "../../../../storage/mod.ts";
import { Scope } from "../../modules/scope/mod.ts";

export default async function Tui(app: IApplication): Promise<void> {
  const req = await app.store.get(HttpRequest.name, "Salesforce Primary/BasicFunctionality") as HttpRequest;
  const collections = (await app.store.get(Scope.name, "Salesforce Primary")).Children;

  return run(app, collections, req);
}

const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE"];

async function run(app: IApplication, collections: Model[], req: HttpRequest): Promise<void> {
  const tui = new TuiMod({
    refreshRate: 1000 / 60, // Run in 60FPS
  });
  tui.dispatch(); // Close Tui on CTRL+C
  handleInput(tui);
  handleMouseControls(tui);
  handleKeyboardControls(tui);

  const collectionOptions = {
    parent: tui,
    theme: {
      base: crayon.bgBlack.white,
      frame: {},
      header: { base: crayon.magenta },
      selectedRow: {
        base: crayon.bold.bgBlue.white,
        focused: crayon.bold.bgLightBlue.white,
        active: crayon.bold.bgMagenta.black,
      },
    },
    rectangle: {
      column: 0,
      row: 0,
      height: 20,
    },
    headers: [
      { title: "(ー。ー) Zzz                        " },
    ],
    data: collections.map((model: Model) => [model.Method ? model.Name : `› ${model.Name}`]),
    charMap: "rounded",
    zIndex: 0,
  } as TableOptions;

  const requestFrameOptions = {
    parent: tui,
    charMap: "rounded",
    theme: {
      base: crayon.white,
    },
    rectangle: {
      column: 40,
      row: 1,
      height: 20,
      width: 100,
    },
    zIndex: 0,
  } as FrameOptions;

  const nameOptions = {
    parent: tui,
    align: {
      horizontal: "center",
      vertical: "center",
    },
    theme: {
      base: crayon.bold.white,
    },
    rectangle: {
      column: requestFrameOptions.rectangle.column! + 1,
      row: requestFrameOptions.rectangle.row!,
    },
    zIndex: 0,
    text: req.Name,
  } as LabelOptions;

  const methodBoxOptions = {
    parent: tui,
    items: HTTP_METHODS,
    placeholder: "Method",
    theme: {
      base: crayon.bgBlack,
      focused: crayon.bgBlack.white,
      active: crayon.bgYellow,
    },
    rectangle: {
      column: nameOptions.rectangle.column!,
      row: nameOptions.rectangle.row! + 2,
      height: 1,
      width: 7,
    },
    zIndex: 0,
    // text: req.Method,
    selectedItem: HTTP_METHODS.indexOf(req.Method),
  } as ComboBoxOptions;

  const sendOptions = {
    parent: tui,
    label: { text: "Send" },
    theme: {
      base: crayon.bgMagenta,
      focused: crayon.bgMagenta.white.bold,
      active: crayon.bgYellow,
    },
    rectangle: {
      column: requestFrameOptions.rectangle.column! + requestFrameOptions.rectangle.width! - 7,
      row: methodBoxOptions.rectangle.row!,
      height: 1,
      width: 6,
    },
    zIndex: 0,
  };
  const urlOptions = {
    parent: tui,
    placeholder: "Enter URL",
    theme: {
      base: crayon.bgBlack.white,
      focused: crayon.bgBlack.yellow,
      active: crayon.bgBlack.red,
      cursor: {
        base: crayon.bgWhite,
        focused: crayon.bgMagenta,
        active: crayon.red,
      },
    },
    rectangle: {
      column: methodBoxOptions.rectangle.column! + methodBoxOptions.rectangle.width! + 1,
      row: methodBoxOptions.rectangle.row!,
      width: requestFrameOptions.rectangle.width! - methodBoxOptions.rectangle.width! - sendOptions.rectangle.width! - 4,
    },
    zIndex: 0,
    text: req.URL,
  } as InputOptions;

  const reqFrame = new Frame(requestFrameOptions);
  const nameLabel = new Label({ ...nameOptions, parent: reqFrame });
  const urlInput = new Input({ ...urlOptions, parent: reqFrame });
  const sendButton = new Button({ ...sendOptions, parent: reqFrame });
  const methodBox = new ComboBox({ ...methodBoxOptions, parent: reqFrame });
  const collectionTable = new Table(collectionOptions);

  collectionTable.on("keyPress", ({ key, ctrl, meta, shift }) => {
    const selectedIndex = collectionTable.selectedRow.value;
    const selectedModel = collections[selectedIndex];
    if (key === "return") {
      if (selectedModel.Method) {
        openRequest(selectedModel as HttpRequest);
      } else {
        expandCollection(selectedModel as Collection);
      }
    }
    if (key === "right") {
      if (!selectedModel.Method) {
        // `right` == expand: change carot to ⌄?
        expandCollection(selectedModel as Collection);
      }
    }
    if (key === "left") {
      if (!selectedModel.Method) {
        // `left` == collapse: change carot back to ›
        collapsedCollection(selectedModel as Collection);
      }
    }
  });
  return Promise.resolve(tui.run());
}

function expandCollection(collection: Collection): void {
  console.log("Expand collection", collection.Name);
}
function collapsedCollection(collection: Collection): void {
  console.log("Collapse collection", collection.Name);
}
function openRequest(req: HttpRequest): void {
  console.log("Open request", req.Name);
}
