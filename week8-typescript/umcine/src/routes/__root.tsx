import { createRootRoute } from "@tanstack/react-router";
import { RootLayout } from "../components/layout/root-layout";

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: () => (
    <main className="mx-auto max-w-290 flex-1 px-6 py-10">페이지를 찾을 수 없어요.</main>
  ),
});
