import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En local, con VITE_API_URL vacío, el navegador llama a /api y Vite
// reenvía al Express de este proyecto. En Render la variable apunta
// a la URL pública del backend y este proxy no se usa.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
