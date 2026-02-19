"use client";

import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

interface Activity {
  id: string;
  timestamp: string;
  type: "cron" | "tool" | "session" | "memory";
  title: string;
  detail: string;
}

const seedActivities: Activity[] = [
  {
    id: "act_1",
    timestamp: "2026-02-19 08:10",
    type: "cron",
    title: "Daily KPI Snapshot",
    detail: "Generated sample KPI rollup for dashboard preview.",
  },
  {
    id: "act_2",
    timestamp: "2026-02-19 07:55",
    type: "tool",
    title: "Wiki Search",
    detail: "Queried SOP page for onboarding content links.",
  },
  {
    id: "act_3",
    timestamp: "2026-02-19 07:30",
    type: "session",
    title: "Team Sync",
    detail: "Morning planning session logged by ops team.",
  },
  {
    id: "act_4",
    timestamp: "2026-02-18 22:40",
    type: "memory",
    title: "Memory Updated",
    detail: "Saved notes from KPI design walkthrough.",
  },
];

const seedCron = [
  { id: "job_1", name: "daily-kpi-rollup", schedule: "0 6 * * *", nextRun: "2026-02-20 06:00", enabled: true },
  { id: "job_2", name: "weekly-revenue-check", schedule: "0 8 * * 1", nextRun: "2026-02-23 08:00", enabled: true },
  { id: "job_3", name: "nightly-backup", schedule: "0 1 * * *", nextRun: "2026-02-20 01:00", enabled: false },
];

export function MissionControlClient({ canEdit }: { canEdit: boolean }) {
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState(seedActivities);
  const [cronJobs, setCronJobs] = useState(seedCron);

  const filteredActivities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q)
    );
  }, [activities, query]);

  return (
    <>
      <ModuleHeader
        title="Mission Control"
        description="OpenClaw activity feed, cron calendar, and search — sample mode."
        right={
          <>
            <input
              placeholder="Search activities"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              className="btn"
              type="button"
              onClick={() =>
                setActivities((current) => [
                  {
                    id: `act_${Date.now()}`,
                    timestamp: new Date().toLocaleString(),
                    type: "tool",
                    title: "Manual Refresh",
                    detail: "Operator triggered refresh in demo mode.",
                  },
                  ...current,
                ])
              }
            >
              Simulate Event
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Events (24h)" value={String(activities.length)} note="Sample feed count" />
        <StatCard title="Cron Jobs" value={String(cronJobs.length)} note="Configured jobs" />
        <StatCard
          title="Enabled Jobs"
          value={String(cronJobs.filter((job) => job.enabled).length)}
          note="Toggle in table"
        />
        <StatCard title="Search Matches" value={String(filteredActivities.length)} note="Based on query" />
      </section>

      <section className="split-2">
        <article className="panel">
          <h4>Activity Feed</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((item) => (
                  <tr key={item.id}>
                    <td>{item.timestamp}</td>
                    <td>
                      <span className={`chip ${item.type === "cron" ? "auto" : item.type === "tool" ? "warn" : "danger"}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.title}</td>
                    <td>{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h4>Cron Jobs</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Schedule</th>
                  <th>Next Run</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cronJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.name}</td>
                    <td>{job.schedule}</td>
                    <td>{job.nextRun}</td>
                    <td>
                      <span className={`chip ${job.enabled ? "auto" : "danger"}`}>
                        {job.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="control-row">
                      <button
                        className="btn"
                        type="button"
                        disabled={!canEdit}
                        onClick={() =>
                          setCronJobs((current) =>
                            current.map((entry) =>
                              entry.id === job.id ? { ...entry, enabled: !entry.enabled } : entry
                            )
                          )
                        }
                      >
                        Toggle
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() =>
                          setActivities((current) => [
                            {
                              id: `run_${Date.now()}`,
                              timestamp: new Date().toLocaleString(),
                              type: "cron",
                              title: `Triggered ${job.name}`,
                              detail: "Manual run initiated from Mission Control demo.",
                            },
                            ...current,
                          ])
                        }
                      >
                        Run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}
