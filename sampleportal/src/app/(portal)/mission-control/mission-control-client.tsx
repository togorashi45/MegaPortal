"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

interface Activity {
  id: string;
  timestamp: string;
  type: "cron" | "tool" | "session" | "memory" | "error";
  title: string;
  detail: string;
  source: string;
}

const seedActivities: Activity[] = [
  {
    id: "act_1",
    timestamp: "2026-02-19 08:10",
    type: "cron",
    title: "Daily KPI Snapshot",
    detail: "Generated sample KPI rollup for dashboard preview.",
    source: "/api/kpi/rollup",
  },
  {
    id: "act_2",
    timestamp: "2026-02-19 07:55",
    type: "tool",
    title: "Wiki Search",
    detail: "Queried SOP page for onboarding content links.",
    source: "/api/search",
  },
  {
    id: "act_3",
    timestamp: "2026-02-19 07:30",
    type: "session",
    title: "Team Sync",
    detail: "Morning planning session logged by ops team.",
    source: "/portal/dashboard",
  },
  {
    id: "act_4",
    timestamp: "2026-02-18 22:40",
    type: "memory",
    title: "Memory Updated",
    detail: "Saved notes from KPI design walkthrough.",
    source: "memory/2026-02-18.md",
  },
  {
    id: "act_5",
    timestamp: "2026-02-19 08:34",
    type: "error",
    title: "KPI Rollup Failure",
    detail: "Timeout while reading staged sample data feed.",
    source: "/api/mission-control/activity",
  },
];

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  timezone: string;
  nextRun: string;
  lastRun: string;
  enabled: boolean;
  lastStatus: "ok" | "error" | "n/a";
  payload: string;
}

const seedCron: CronJob[] = [
  {
    id: "job_1",
    name: "daily-kpi-rollup",
    schedule: "0 6 * * *",
    timezone: "UTC",
    nextRun: "2026-02-20 06:00",
    lastRun: "2026-02-19 06:00",
    enabled: true,
    lastStatus: "ok",
    payload: "Generate KPI summary and update dashboard snapshot.",
  },
  {
    id: "job_2",
    name: "weekly-revenue-check",
    schedule: "0 8 * * 1",
    timezone: "UTC",
    nextRun: "2026-02-23 08:00",
    lastRun: "2026-02-16 08:00",
    enabled: true,
    lastStatus: "ok",
    payload: "Compile revenue sources and trigger executive digest.",
  },
  {
    id: "job_3",
    name: "nightly-backup",
    schedule: "0 1 * * *",
    timezone: "UTC",
    nextRun: "2026-02-20 01:00",
    lastRun: "2026-02-19 01:00",
    enabled: false,
    lastStatus: "n/a",
    payload: "Archive module state snapshots for rollback drills.",
  },
];

const corpus = [
  {
    file: "memory/2026-02-19.md",
    lines: [
      "KPI pacing warning: CPL above $15 target.",
      "Automation task failed three times in a row.",
      "Need to tighten ad creative rotation.",
    ],
  },
  {
    file: "docs/ops-playbook.md",
    lines: [
      "Escalate any automation failure after two retries.",
      "Mission Control should be checked twice daily.",
    ],
  },
  {
    file: "wiki/marketing.md",
    lines: [
      "Campaign launch checklist includes KPI baseline capture.",
      "Review conversion path every Friday.",
    ],
  },
];

const liveTemplates: Array<Omit<Activity, "id" | "timestamp">> = [
  {
    type: "tool",
    title: "Search Index Updated",
    detail: "Workspace search cache refreshed in sample mode.",
    source: "/api/search",
  },
  {
    type: "session",
    title: "Operator Checkpoint",
    detail: "Manual checkpoint logged by dashboard operator.",
    source: "/portal/mission-control",
  },
  {
    type: "cron",
    title: "Scheduled Sync Complete",
    detail: "Background sync simulated successfully.",
    source: "/api/mission-control/cron",
  },
];

type View = "feed" | "cron" | "search" | "analytics";

function typeChip(type: Activity["type"]): string {
  if (type === "cron" || type === "memory") return "chip auto";
  if (type === "tool" || type === "session") return "chip warn";
  return "chip danger";
}

export function MissionControlClient({ canEdit }: { canEdit: boolean }): ReactElement {
  const [view, setView] = useState<View>("feed");
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activities, setActivities] = useState(seedActivities);
  const [cronJobs, setCronJobs] = useState(seedCron);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [pauseFeed, setPauseFeed] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(seedCron[0].id);

  const filteredActivities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.detail.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
    );
  }, [activities, query]);

  const searchResults = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    return corpus
      .map((file) => ({
        file: file.file,
        matches: file.lines
          .map((line, index) => ({ line: index + 1, text: line }))
          .filter((entry) => entry.text.toLowerCase().includes(q)),
      }))
      .filter((row) => row.matches.length > 0);
  }, [searchTerm]);

  const selectedJob = useMemo(
    () => cronJobs.find((job) => job.id === selectedJobId) ?? cronJobs[0],
    [cronJobs, selectedJobId]
  );

  const typeCounts = useMemo(() => {
    return activities.reduce<Record<Activity["type"], number>>(
      (acc, activity) => {
        acc[activity.type] += 1;
        return acc;
      },
      { cron: 0, tool: 0, session: 0, memory: 0, error: 0 }
    );
  }, [activities]);

  useEffect(() => {
    if (!liveEnabled || pauseFeed) return;
    const timer = window.setInterval(() => {
      const template =
        liveTemplates[Math.floor(Math.random() * liveTemplates.length)];
      setActivities((current) => [
        {
          ...template,
          id: `live_${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date().toLocaleString(),
        },
        ...current,
      ]);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [liveEnabled, pauseFeed]);

  function addManualEvent(): void {
    setActivities((current) => [
      {
        id: `manual_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        type: "tool",
        title: "Manual Refresh",
        detail: "Operator triggered refresh in demo mode.",
        source: "/portal/mission-control",
      },
      ...current,
    ]);
    setNotice("Manual event appended to activity feed.");
  }

  function triggerJob(job: CronJob): void {
    setActivities((current) => [
      {
        id: `run_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        type: "cron",
        title: `Triggered ${job.name}`,
        detail: "Manual run initiated from Mission Control demo.",
        source: `/api/mission-control/cron/${job.id}/trigger`,
      },
      ...current,
    ]);
    setCronJobs((current) =>
      current.map((entry) =>
        entry.id === job.id
          ? {
              ...entry,
              lastRun: new Date().toLocaleString(),
              lastStatus: "ok",
            }
          : entry
      )
    );
    setNotice(`Ran job: ${job.name}`);
  }

  function removeJob(id: string): void {
    if (!canEdit) return;
    setCronJobs((current) => current.filter((job) => job.id !== id));
    setNotice("Removed cron job from sample scheduler.");
  }

  return (
    <>
      <ModuleHeader
        title="Mission Control"
        description="OpenClaw activity feed, cron controls, workspace search, and analytics in sample mode."
        right={
          <>
            <div className="control-row">
              <button className="btn" type="button" onClick={() => setView("feed")}>
                Feed
              </button>
              <button className="btn" type="button" onClick={() => setView("cron")}>
                Cron
              </button>
              <button className="btn" type="button" onClick={() => setView("search")}>
                Search
              </button>
              <button className="btn" type="button" onClick={() => setView("analytics")}>
                Analytics
              </button>
            </div>
            <button
              className="btn"
              type="button"
              onClick={addManualEvent}
            >
              Simulate Event
            </button>
            <button className="btn" type="button" onClick={() => setPauseFeed((state) => !state)}>
              {pauseFeed ? "Resume Feed" : "Pause Feed"}
            </button>
            <button className="btn" type="button" onClick={() => setLiveEnabled((state) => !state)}>
              {liveEnabled ? "Disable Live" : "Enable Live"}
            </button>
          </>
        }
      />

      {notice ? <div className="alert">{notice}</div> : null}

      <section className="card-grid">
        <StatCard title="Events (24h)" value={String(activities.length)} note="Sample feed count" />
        <StatCard title="Cron Jobs" value={String(cronJobs.length)} note="Configured jobs" />
        <StatCard
          title="Enabled Jobs"
          value={String(cronJobs.filter((job) => job.enabled).length)}
          note="Toggle in table"
        />
        <StatCard title="Errors Logged" value={String(typeCounts.error)} note="Escalate after 2+ retries" />
      </section>

      {view === "feed" ? (
        <section className="split-2">
          <article className="panel">
            <h4>Activity Feed</h4>
            <div className="control-row" style={{ marginTop: 8 }}>
              <input
                placeholder="Search activities"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className={`chip ${liveEnabled && !pauseFeed ? "auto" : "warn"}`}>
                {liveEnabled && !pauseFeed ? "LIVE" : "PAUSED"}
              </span>
            </div>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Detail</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((item) => (
                    <tr key={item.id}>
                      <td>{item.timestamp}</td>
                      <td>
                        <span className={typeChip(item.type)}>{item.type}</span>
                      </td>
                      <td>{item.title}</td>
                      <td>{item.detail}</td>
                      <td>{item.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h4>Live Type Mix</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Count</th>
                    <th>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(typeCounts) as Array<keyof typeof typeCounts>).map((key) => {
                    const count = typeCounts[key];
                    const percent = activities.length > 0 ? (count / activities.length) * 100 : 0;
                    return (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{count}</td>
                        <td>{percent.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {view === "cron" ? (
        <section className="split-2">
          <article className="panel">
            <h4>Cron Job Manager</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Job</th>
                    <th>Schedule</th>
                    <th>TZ</th>
                    <th>Next Run</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cronJobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <button className="btn" type="button" onClick={() => setSelectedJobId(job.id)}>
                          {job.name}
                        </button>
                      </td>
                      <td>
                        <input
                          value={job.schedule}
                          disabled={!canEdit}
                          onChange={(event) =>
                            setCronJobs((current) =>
                              current.map((entry) =>
                                entry.id === job.id
                                  ? { ...entry, schedule: event.target.value }
                                  : entry
                              )
                            )
                          }
                        />
                      </td>
                      <td>{job.timezone}</td>
                      <td>{job.nextRun}</td>
                      <td>
                        <span className={`chip ${job.enabled ? "auto" : "warn"}`}>
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
                                entry.id === job.id
                                  ? { ...entry, enabled: !entry.enabled }
                                  : entry
                              )
                            )
                          }
                        >
                          Toggle
                        </button>
                        <button className="btn" type="button" onClick={() => triggerJob(job)}>
                          Run Now
                        </button>
                        <button className="btn" type="button" disabled={!canEdit} onClick={() => removeJob(job.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h4>Selected Job Detail</h4>
            {selectedJob ? (
              <div className="table-wrap" style={{ marginTop: 8 }}>
                <table>
                  <tbody>
                    <tr>
                      <th>Name</th>
                      <td>{selectedJob.name}</td>
                    </tr>
                    <tr>
                      <th>Last Run</th>
                      <td>{selectedJob.lastRun}</td>
                    </tr>
                    <tr>
                      <th>Last Status</th>
                      <td>
                        <span className={`chip ${selectedJob.lastStatus === "ok" ? "auto" : selectedJob.lastStatus === "error" ? "danger" : "warn"}`}>
                          {selectedJob.lastStatus}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Payload</th>
                      <td>{selectedJob.payload}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="muted">No job selected.</p>
            )}
          </article>
        </section>
      ) : null}

      {view === "search" ? (
        <section className="split-2">
          <article className="panel form-grid">
            <h4>Workspace Search</h4>
            <label>
              Query
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="kpi, automation, failure..."
              />
            </label>
            <p className="muted">
              Searches a demo corpus of workspace files for walkthrough purposes.
            </p>
          </article>
          <article className="panel">
            <h4>Search Results</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Matches</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.length === 0 ? (
                    <tr>
                      <td colSpan={2}>No matches yet.</td>
                    </tr>
                  ) : (
                    searchResults.map((row) => (
                      <tr key={row.file}>
                        <td>{row.file}</td>
                        <td>
                          {row.matches.map((match) => (
                            <p key={`${row.file}-${match.line}`}>
                              L{match.line}: {match.text}
                            </p>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}

      {view === "analytics" ? (
        <section className="split-2">
          <article className="panel">
            <h4>Feed Analytics</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Events</td>
                    <td>{activities.length}</td>
                  </tr>
                  <tr>
                    <td>Error Events</td>
                    <td>{typeCounts.error}</td>
                  </tr>
                  <tr>
                    <td>Cron Events</td>
                    <td>{typeCounts.cron}</td>
                  </tr>
                  <tr>
                    <td>Interactive Tool Events</td>
                    <td>{typeCounts.tool}</td>
                  </tr>
                  <tr>
                    <td>Live Stream</td>
                    <td>{liveEnabled ? "Enabled" : "Disabled"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
          <article className="panel">
            <h4>Cron Analytics</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Configured Jobs</td>
                    <td>{cronJobs.length}</td>
                  </tr>
                  <tr>
                    <td>Enabled Jobs</td>
                    <td>{cronJobs.filter((job) => job.enabled).length}</td>
                  </tr>
                  <tr>
                    <td>Jobs with Last Error</td>
                    <td>{cronJobs.filter((job) => job.lastStatus === "error").length}</td>
                  </tr>
                  <tr>
                    <td>Paused Jobs</td>
                    <td>{cronJobs.filter((job) => !job.enabled).length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </section>
      ) : null}
    </>
  );
}
