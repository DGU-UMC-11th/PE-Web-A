import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "next-env.d.ts", "nextjs-example/**"]),
  {
    files: ["src/**/*.tsx"],
    rules: {
      // Keep existing image markup and data-URL avatar previews.
      "@next/next/no-img-element": "off",
    },
  },
]);
