import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStore {
  accessToken: string | null;
  setAccessToken: (accessToken: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      setAccessToken: (accessToken) => set({ accessToken }),
    }),
    {
      name: "umcine-auth-store",
      skipHydration: true,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            if (value !== null) JSON.parse(value);
            return value;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => localStorage.setItem(name, value),
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({ accessToken: state.accessToken }),
    },
  ),
);