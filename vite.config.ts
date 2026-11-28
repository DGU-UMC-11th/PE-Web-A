import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ command, mode }) => {
  const { VITE_API_BASE_URL } = loadEnv(mode, process.cwd());

  return {
    plugins: [
      tanstackRouter({ autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    server: command === "serve" && VITE_API_BASE_URL
      ? {
          proxy: {
            "^/api/(?:auth/login$|(?:members|favorites|ratings)(?:/|$))": {
              target: VITE_API_BASE_URL,
              rewrite: (path) => path.slice("/api".length),
            },
          },
        }
      : undefined,
  };
});
