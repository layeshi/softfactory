import React from "react";
import Link from "next/link";

const items = [
  { href: "/", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/documents", label: "Documents" },
  { href: "/approvals", label: "Approvals" },
];

export function SidebarNav() {
  return (
    <nav className="sidebar-nav" aria-label="Primary">
      <div className="sidebar-brand">
        <span className="sidebar-kicker">Softfactory</span>
        <h1>Software Factory</h1>
        <p>Local console for requirement-led delivery.</p>
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
