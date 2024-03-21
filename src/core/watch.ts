// This was yoinked from https://github.com/Caesar2011/rhinoder and modified

const throttle = 500;
const processArgs = Deno.args;
let app: Deno.Process = startProcess(processArgs);
let timeout: number | null = null;

async function watchFiles(watchDir: string): Promise<void> {
  for await (const event of Deno.watchFs(watchDir)) {
    if (event.kind !== "access") {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(loadApp, throttle);
    }
  }
}
function startProcess(args: string[] = []): Deno.Process {
  return Deno.run({ cmd: ["deno", "run", ...args] });
}

function loadApp() {
  if (app) app.close();
  console.log("Reloading...");
  app = startProcess(processArgs);
}

watchFiles("src");
