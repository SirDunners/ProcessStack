import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "root/apps/web",
  plugins: [react()],
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
});
