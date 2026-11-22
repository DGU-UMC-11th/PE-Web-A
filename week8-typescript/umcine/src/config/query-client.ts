import { QueryClient } from "@tanstack/react-query";

export const ONE_MINUTE = 60 * 1000;
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ONE_MINUTE,
      gcTime: 5 * ONE_MINUTE,
      retry: 1,
    },
  },
});
