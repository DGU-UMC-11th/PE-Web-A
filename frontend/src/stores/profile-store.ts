import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ProfileStore {
  nickname: string;
  email: string;
  avatar: string;
  updateProfile: (profile: { nickname: string; avatar: string }) => void;
  setEmail: (email: string) => void;
  setMember: (member: { email: string; nickname: string }) => void;
}

// 퍼블리싱 단계에서 입력한 정보를 새로고침 후에도 확인하기 위한 저장소.
export const useProfileStore = create<ProfileStore>()(persist((set) => ({
  nickname: "",
  email: "",
  avatar: "",
  updateProfile: (profile) => set(profile),
  setEmail: (email) => set((state) => state.email === email
    ? { email }
    : { email, nickname: "", avatar: "" }),
  setMember: (member) => set({ ...member, avatar: "" }),
}), {
  name: "umcine-profile",
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
  version: 1,
  migrate: (persisted) => {
    const profile = (persisted ?? {}) as Partial<ProfileStore>;
    // 이전 퍼블리싱 예시 값은 실제 회원 정보로 취급하지 않는다.
    return { ...profile, nickname: profile.nickname === "gs0428" ? "" : profile.nickname,
      email: profile.email === "gwangsoo@cinemalab.kr" ? "" : profile.email };
  },
}));
