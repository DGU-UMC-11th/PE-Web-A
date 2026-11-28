import ky from "ky";
import { env } from "../config/env";

export const apiClient = ky.create({
  baseUrl: process.env.NODE_ENV === "development" && env.apiBaseUrl
    ? "/api/"
    : env.apiBaseUrl,
});
