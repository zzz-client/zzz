import { defineConfig } from "npm:vite";
import vue from "npm:@vitejs/plugin-vue";
import viteDeno from "https://deno.land/x/vite_deno_plugin/mod.ts";

// NOTE(bartlomieju): this is a papercut that shouldn't be required, see README.md
import "npm:vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteDeno({ importMapFilename: "../../../../../deno.jsonc" })],
});
