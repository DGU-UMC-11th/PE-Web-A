import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface AuthStore {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(persist(
  set => ({ accessToken: null, setAccessToken: accessToken => set({ accessToken }) }),
  {
    name: 'umcine-auth-store',
    storage: createJSONStorage(() => localStorage),
    partialize: state => ({ accessToken: state.accessToken }),
    merge: (saved, current) => {
      const token = (saved as Partial<AuthStore> | null)?.accessToken;
      return { ...current, accessToken: typeof token === 'string' && token.trim() ? token : null };
    },
  },
));
