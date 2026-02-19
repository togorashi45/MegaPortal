"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/types/portal";

interface NavItem {
  key: string;
  label: string;
  path: string;
  description: string;
}

export function PortalNav({
  items,
  role,
}: {
  items: NavItem[];
  role: Role;
}) {
  const pathname = usePathname();

  return (
    <aside className="portal-sidebar">
      <div className="brand-box">
        <p className="eyebrow">The Real Estate Reset</p>
        <h1>Sample Portal</h1>
        <p className="muted">sampleportal.rspur.com</p>
      </div>

      <nav className="nav-list" aria-label="Portal Modules">
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <Link key={item.key} href={item.path} className={`nav-item ${active ? "active" : ""}`}>
              <span>{item.label}</span>
              <small>{item.description}</small>
            </Link>
          );
        })}
      </nav>

      <div className="role-pill">Signed in as: {role}</div>
    </aside>
  );
}
