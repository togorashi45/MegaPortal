"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ModuleKey, Role } from "@/types/portal";

interface NavItem {
  key: ModuleKey;
  label: string;
  path: string;
  description: string;
}

type NavSectionKey = "core" | "business" | "capital" | "personal";

const sectionLabels: Record<NavSectionKey, string> = {
  core: "Core Portal",
  business: "Operations Modules",
  capital: "Capital & Finance",
  personal: "Private Personal",
};

const sectionOrder: NavSectionKey[] = ["core", "business", "capital", "personal"];

function getSection(key: ModuleKey): NavSectionKey {
  if (
    [
      "dashboard",
      "mission-control",
      "kpi",
      "gps",
      "tasks",
      "wiki",
      "calendar",
      "training",
      "hr",
      "admin",
      "automation-engine",
    ].includes(key)
  ) {
    return "core";
  }

  if (
    [
      "assets",
      "deal-analyzer",
      "comp-tracker",
      "contractor-directory",
      "appfolio-dashboard",
      "tax-insurance",
      "note-tracker",
      "flip-tracker",
      "cashflow",
      "rehab-scope",
      "document-vault",
      "decisions",
    ].includes(key)
  ) {
    return "business";
  }

  if (["lending-capital-tracker", "flip-forecasting-dashboard"].includes(key)) {
    return "capital";
  }

  return "personal";
}

export function PortalNav({
  items,
  role,
}: {
  items: NavItem[];
  role: Role;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle)
    );
  }, [items, query]);

  const grouped = useMemo(() => {
    const map: Record<NavSectionKey, NavItem[]> = {
      core: [],
      business: [],
      capital: [],
      personal: [],
    };
    for (const item of filtered) {
      map[getSection(item.key)].push(item);
    }
    return map;
  }, [filtered]);

  return (
    <aside className="portal-sidebar">
      <div className="brand-box">
        <p className="eyebrow">The Real Estate Reset</p>
        <h1>Sample Portal</h1>
        <p className="muted">sampleportal.rspur.com</p>
      </div>

      <div className="form-grid">
        <label htmlFor="module-filter" className="muted">
          Module Search
        </label>
        <input
          id="module-filter"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search modules..."
          aria-label="Search modules"
        />
      </div>

      <nav className="nav-list" aria-label="Portal Modules">
        {sectionOrder.map((section) =>
          grouped[section].length > 0 ? (
            <section className="nav-section" key={section}>
              <h4>{sectionLabels[section]}</h4>
              {grouped[section].map((item) => {
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`nav-item ${active ? "active" : ""}`}
                  >
                    <span>{item.label}</span>
                    <small>{item.description}</small>
                  </Link>
                );
              })}
            </section>
          ) : null
        )}
      </nav>

      <div className="role-pill">Signed in as: {role}</div>
    </aside>
  );
}
