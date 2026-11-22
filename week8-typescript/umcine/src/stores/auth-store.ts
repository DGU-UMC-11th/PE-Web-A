import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { queryClient } from "../config/query-client";

export const useAuthStore = create<{
  accessToken: string | null;
  session: number;
  setAccessToken: (token: string | null) => void;
}>()(persist((set) => ({
  accessToken: null,
  session: 0,
  setAccessToken: (accessToken) => {
    const privateQuery = (query: { queryKey: readonly unknown[] }) =>
      ["members", "favorites", "ratings"].includes(String(query.queryKey[0]));
    void queryClient.cancelQueries({ predicate: privateQuery });
    queryClient.removeQueries({ predicate: privateQuery });
    set((state) => ({ accessToken, session: state.session + 1 }));
  },
}), {
  name: "umcine-auth-store",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ accessToken: state.accessToken }),
}));

// 공개 평점 조회에 필요한 ID만 읽고, 인증 여부는 서버에서 판단해요.
export function getMemberId(token: string | null): number | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(part)) as { sub?: string; memberId?: number };
    const id = Number(payload.memberId ?? payload.sub);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
