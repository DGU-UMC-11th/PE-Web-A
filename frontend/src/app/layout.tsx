import type { Metadata } from "next";
import type { ReactNode } from "react";
import Header from "../components/layout/header";
import Footer from "../components/footer";
import { Providers } from "./providers";
import "../index.css";

export const metadata: Metadata = {
  title: "UMCine",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="flex min-h-screen flex-col bg-[#f5f6f8]">
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
