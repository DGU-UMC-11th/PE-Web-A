"use client";

import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useAuthStore } from "../stores/auth-store";

export function AuthGuard({ children, guest = false }: { children: ReactNode; guest?: boolean }) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const hydrated = useSyncExternalStore(
    useAuthStore.persist.onFinishHydration,
    useAuthStore.persist.hasHydrated,
    () => false,
  );
  const allowed = guest ? !accessToken : Boolean(accessToken);

  useEffect(() => {
    if (hydrated && !allowed) router.replace(guest ? "/" : "/login");
  }, [allowed, guest, hydrated, router]);

  return (hydrated && allowed) || (guest && !hydrated) ? children : null;
}
