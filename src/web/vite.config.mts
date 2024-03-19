import { defineConfig } from "npm:vite";
import vue from "npm:@vitejs/plugin-vue";
import viteDeno from "https://deno.land/x/vite_deno_plugin/mod.ts";

// NOTE(bartlomieju): this is a papercut that shouldn't be required, see README.md
import "npm:vue";

// https://vitejs.dev/config/
export default defineConfig({
  root: "./",
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: "./index.html",
    },
    emptyOutDir: true,
    outDir: "../../dist/web",
  },
  resolve: {
    alias: {
      "npm:axios": "axios",
      "npm:primevue/menuitem": "primevue/menuitem",
      "npm:vue": "vue",
      "npm:mitt": "mitt",
      "npm:@ngneat/elf": "@ngneat/elf",
      "npm:@ngneat/elf-persist-state": "@ngneat/elf-persist-state",
    },
  },
  plugins: [vue(), viteDeno({ importMapFilename: "../../deno.jsonc" })],
});
