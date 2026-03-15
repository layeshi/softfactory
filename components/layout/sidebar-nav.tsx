import React from "react";
import Link from "next/link";

type SidebarNavProps = {
  labels: {
    brandKicker: string;
    brandTitle: string;
    brandDescription: string;
    nav: {
      dashboard: string;
      projects: string;
      documents: string;
      approvals: string;
    };
  };
};

export function SidebarNav({ labels }: SidebarNavProps) {
  const items = [
    { href: "/", label: labels.nav.dashboard },
    { href: "/projects", label: labels.nav.projects },
    { href: "/documents", label: labels.nav.documents },
    { href: "/approvals", label: labels.nav.approvals },
  ];

  return (
    <nav className="sidebar-nav" aria-label="Primary">
      <div className="sidebar-brand">
        <span className="sidebar-kicker">{labels.brandKicker}</span>
        <h1>{labels.brandTitle}</h1>
        <p>{labels.brandDescription}</p>
      </div>
      <div className="sidebar-links">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="sidebar-link">
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
