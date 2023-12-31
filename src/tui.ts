var blessed = require("reblessed");
var mainScreen = blessed.screen({
  smartCSR: true,
});

mainScreen.title = "my window title";

var form = blessed.form({
  parent: mainScreen,
  keys: true,
  left: "center",
  top: "center",
  width: 30,
  height: 8,
  bg: "green",
  autoNext: true,
  content: "Add Alert",
});

var greaterThanEdit = blessed.textbox({
  parent: form,
  top: 3,
  height: 1,
  left: 2,
  right: 2,
  bg: "black",
  keys: true,
  inputOnFocus: true,
  content: "test",
});

// Create a box perfectly centered horizontally and vertically.
var box = blessed.box({
  top: "center",
  left: "center",
  width: "50%",
  height: "50%",
  content: "Hello {bold}world{/bold}!",
  tags: true,
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "magenta",
    border: {
      fg: "#f0f0f0",
    },
    hover: {
      bg: "green",
    },
  },
});

// Append our box to the screen.
// mainScreen.append(box);
mainScreen.append(form);

// Add a png icon to the box
var icon = blessed.image({
  parent: box,
  top: 0,
  left: 0,
  type: "overlay",
  width: "shrink",
  height: "shrink",
  file: __dirname + "/my-program-icon.png",
  search: false,
});

// If our box is clicked, change the content.
box.on("click", function (data) {
  box.setContent("{center}Some different {red-fg}content{/red-fg}.{/center}");
  mainScreen.render();
});

// If box is focused, handle `enter`/`return` and give us some more content.
box.key("enter", function (ch, key) {
  box.setContent("{right}Even different {black-fg}content{/black-fg}.{/right}\n");
  box.setLine(1, "bar");
  box.insertLine(1, "foo");
  mainScreen.render();
});

// Quit on Escape, q, or Control-C.
mainScreen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});

// Focus our element.
greaterThanEdit.focus();

// Render the screen.
mainScreen.render();
