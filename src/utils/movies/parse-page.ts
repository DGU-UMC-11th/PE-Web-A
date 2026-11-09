// TMDB accepts page numbers from 1 through 500.
export function parsePage(value: unknown): number | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 && page <= 500 ? page : undefined;
}
