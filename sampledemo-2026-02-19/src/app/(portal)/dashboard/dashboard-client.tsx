"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { moduleRegistry } from "@/data/modules";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

const initialAnnouncements = [
  { id: "a1", title: "Demo Build Sprint", detail: "All modules are now running in sample mode.", read: false },
  { id: "a2", title: "KPI Walkthrough", detail: "Record product walkthrough content from KPI and GPS first.", read: false },
  { id: "a3", title: "VPS Prep", detail: "Deploy to sampleportal.rspur.com after QA pass.", read: true },
];

const refinedNext = new Set([
  "kpi",
  "mission-control",
  "tasks",
  "wiki",
  "deal-analyzer",
  "flip-forecasting-dashboard",
  "automation-engine",
]);

function moduleStatus(key: string): "Demo Live" | "Refine Next" {
  return refinedNext.has(key) ? "Refine Next" : "Demo Live";
}

export function DashboardClient({
  userName,
  canEdit,
}: {
  userName: string;
  canEdit: boolean;
}) {
  const searchParams = useSearchParams();
  const blocked = searchParams.get("blocked") === "1";
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [focus, setFocus] = useState("Finalize KPI polish and walkthrough script.");
  const [loaded, setLoaded] = useState(false);

  const unread = useMemo(
    () => announcements.filter((item) => !item.read).length,
    [announcements]
  );

  useEffect(() => {
    const savedFocus = window.localStorage.getItem("sampleportal.dashboard.focus");
    const savedAnnouncements = window.localStorage.getItem(
      "sampleportal.dashboard.announcements"
    );

    if (savedFocus) setFocus(savedFocus);
    if (savedAnnouncements) {
      try {
        const parsed = JSON.parse(savedAnnouncements) as typeof initialAnnouncements;
        if (Array.isArray(parsed)) setAnnouncements(parsed);
      } catch {
        // ignore malformed saved data
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem("sampleportal.dashboard.focus", focus);
  }, [focus, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      "sampleportal.dashboard.announcements",
      JSON.stringify(announcements)
    );
  }, [announcements, loaded]);

  return (
    <>
      <ModuleHeader
        title="Dashboard"
        description="Landing page for quick access, status checks, and team communication."
      />

      {blocked ? (
        <div className="alert">
          You do not have access to that module with your current role.
        </div>
      ) : null}

      <section className="card-grid">
        <StatCard title="Welcome" value={userName} note="Signed-in user" />
        <StatCard title="Unread Announcements" value={String(unread)} note="Mark as read below" />
        <StatCard title="Modules Live" value={String(moduleRegistry.length)} note="Sample mode enabled" />
        <StatCard title="APIs Connected" value="0" note="Integration intentionally disabled" />
      </section>

      <section className="split-2">
        <article className="panel">
          <h4>Quick Links</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Open</th>
                </tr>
              </thead>
              <tbody>
                {moduleRegistry.map((module) => (
                  <tr key={module.key}>
                    <td>{module.label}</td>
                    <td>{module.description}</td>
                    <td>
                      <span className={`chip ${moduleStatus(module.key) === "Demo Live" ? "auto" : "warn"}`}>
                        {moduleStatus(module.key)}
                      </span>
                    </td>
                    <td>
                      <Link className="btn" href={module.path}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel form-grid">
          <h4>Team Focus</h4>
          <label htmlFor="focus">Current #1 Focus</label>
          <textarea
            id="focus"
            rows={5}
            value={focus}
            disabled={!canEdit}
            onChange={(event) => setFocus(event.target.value)}
          />
          <p className="muted">Editable in sample mode for walkthrough recordings.</p>
        </article>
      </section>

      <article className="panel">
        <h4>Announcements</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Detail</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.detail}</td>
                  <td>
                    <span className={`chip ${item.read ? "auto" : "warn"}`}>
                      {item.read ? "Read" : "Unread"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        setAnnouncements((current) =>
                          current.map((entry) =>
                            entry.id === item.id ? { ...entry, read: !entry.read } : entry
                          )
                        )
                      }
                    >
                      {item.read ? "Mark Unread" : "Mark Read"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
