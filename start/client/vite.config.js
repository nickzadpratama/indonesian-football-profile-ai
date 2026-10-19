import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
// basicSsl() → dev server berjalan di https://localhost:5173 (sertifikat
// self-signed). FB.login hanya boleh dipanggil dari halaman https
// (Enforce HTTPS Facebook), jadi popup Facebook Login butuh dev https ini.
export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api(?=\/|$)/, ""),
      },
      "/genAI": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
