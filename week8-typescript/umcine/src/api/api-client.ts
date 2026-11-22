import ky from "ky";

export const apiClient = ky.create({
  baseUrl: `${(import.meta.env.VITE_API_BASE_URL || "https://workbook.devnoco.com/v8").replace(/\/+$/, "")}/`,
  retry: 0,
});
