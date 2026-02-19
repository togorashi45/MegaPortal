import { moduleRegistry } from "@/data/modules";
import { canAccess } from "@/lib/access";
import { requireSessionUser } from "@/lib/session";
import { PortalNav } from "@/components/portal-nav";
import { LogoutButton } from "@/components/logout-button";
import type { ReactNode } from "react";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireSessionUser();
  const visibleModules = moduleRegistry.filter((module) =>
    canAccess(user, module.key, "VIEW")
  );
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="portal-shell">
      <PortalNav items={visibleModules} role={user.role} />

      <main className="portal-main">
        <header className="top-header">
          <div>
            <h2>RSPUR Internal Portal Demo</h2>
            <p className="muted">
              Sample data mode: full interactions enabled, no live API integrations.
            </p>
            <p className="muted">Build phase: Fast Demo Complete Pass • {today}</p>
          </div>
          <div className="top-actions">
            <span className="chip auto">{user.name}</span>
            <LogoutButton />
          </div>
        </header>

        <section className="module-content">{children}</section>
      </main>
    </div>
  );
}
