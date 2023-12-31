import main from "./src/run.ts";

// Learn more at https://deno.land/manual/examples/module_metadata#concepts
if ((import.meta as any).main) {
    main();
}
