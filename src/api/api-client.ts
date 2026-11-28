import ky from "ky";
import { env } from "../config/env";

export const apiClient = ky.create({
  baseUrl: import.meta.env.DEV && env.apiBaseUrl
    ? new URL("/api/", window.location.origin)
    : env.apiBaseUrl,
});
