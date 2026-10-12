import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          const path = id.replaceAll("\\", "/");
          return path.includes("/node_modules/") &&
            (path.includes("/firebase/") || path.includes("/@firebase/"))
            ? "firebase"
            : undefined;
        },
      },
    },
  },
});
