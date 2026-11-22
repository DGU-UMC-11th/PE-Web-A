import type { ReactNode } from "react";
import "./signup-page.css";

export function AccountLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="signup-page">
      <section className="signup-panel" aria-labelledby="account-title">
        <h1 id="account-title" className="signup-title">
          {title}
        </h1>
        {children}
      </section>
    </main>
  );
}
