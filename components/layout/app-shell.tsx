import React from "react";
import { SidebarNav } from "@/components/layout/sidebar-nav";

type AppShellProps = {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
};

export function AppShell({
  title,
  eyebrow,
  description,
  children,
}: AppShellProps) {
  return (
    <div className="app-frame">
      <SidebarNav />
      <main className="app-main">
        <header className="hero-panel">
          <span className="hero-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </header>
        <section className="content-grid">{children}</section>
      </main>
    </div>
  );
}
