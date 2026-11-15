import { Outlet, useLocation } from "@tanstack/react-router";
import { Header } from "./header";
import { Footer } from "./footer";

export function RootLayout() {
  const pathname = useLocation({ select: (location) => location.pathname });
  const showFooter = !["/login", "/signup", "/me/edit"].includes(pathname.replace(/\/$/, ""));
  return (
    <div className="flex min-h-svh flex-col bg-[#f4f5f7]">
      <Header />
      <Outlet />
      {showFooter && <Footer />}
    </div>
  );
}
