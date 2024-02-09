import { initDi } from "./apps/zzz/app.ts";
import Application from "./apps/zzz/interfaces/http/app.ts";

initDi();

await new Application().run();
