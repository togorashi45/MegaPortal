"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { number } from "@/lib/format";

type JobStatus = "ACTIVE" | "PAUSED" | "ERROR";
type QueueStatus = "QUEUED" | "RUNNING" | "SUCCESS" | "FAILED";

interface AutomationJob {
  id: string;
  name: string;
  module: string;
  schedule: string;
  status: JobStatus;
  owner: string;
  priority: number;
  successRate: number;
  consecutiveErrors: number;
  lastRun: string;
  nextRun: string;
}

interface QueueItem {
  id: string;
  jobId: string;
  jobName: string;
  priority: number;
  status: QueueStatus;
  enqueuedAt: string;
}

interface RuleItem {
  id: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
}

const seedJobs: AutomationJob[] = [
  {
    id: "job_a1",
    name: "Sync Appfolio Summary",
    module: "Appfolio",
    schedule: "0 */4 * * *",
    status: "ACTIVE",
    owner: "Marcus",
    priority: 6,
    successRate: 98,
    consecutiveErrors: 0,
    lastRun: "2026-02-19 08:00",
    nextRun: "2026-02-19 12:00",
  },
  {
    id: "job_a2",
    name: "Rebuild KPI Rollups",
    module: "KPI",
    schedule: "*/30 * * * *",
    status: "ERROR",
    owner: "Codex",
    priority: 8,
    successRate: 76,
    consecutiveErrors: 3,
    lastRun: "2026-02-19 08:30",
    nextRun: "2026-02-19 09:00",
  },
  {
    id: "job_a3",
    name: "Document Vault Index Refresh",
    module: "Documents",
    schedule: "15 * * * *",
    status: "PAUSED",
    owner: "Ops",
    priority: 4,
    successRate: 94,
    consecutiveErrors: 0,
    lastRun: "2026-02-18 23:15",
    nextRun: "Paused",
  },
];

const seedRules: RuleItem[] = [
  {
    id: "rule_1",
    trigger: "KPI status changes to RED",
    condition: "2 consecutive periods",
    action: "Create Mission Control alert + assign task",
    enabled: true,
  },
  {
    id: "rule_2",
    trigger: "Lending maturity <= 14 days",
    condition: "Loan balance > $100K",
    action: "Notify Jake + create review checklist",
    enabled: true,
  },
];

function nowLabel(): string {
  return new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AutomationEngineClient({ canEdit }: { canEdit: boolean }): ReactElement {
  const [jobs, setJobs] = useState<AutomationJob[]>(seedJobs);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [rules, setRules] = useState<RuleItem[]>(seedRules);
  const [logs, setLogs] = useState<string[]>([
    "[init] Sample automation engine ready.",
    "[monitor] Queue watcher online.",
  ]);
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [ruleTrigger, setRuleTrigger] = useState("KPI below threshold");
  const [ruleCondition, setRuleCondition] = useState("2 cycles");
  const [ruleAction, setRuleAction] = useState("Create follow-up task");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const savedJobs = window.localStorage.getItem("sampleportal.automation.jobs");
    const savedRules = window.localStorage.getItem("sampleportal.automation.rules");
    const savedLogs = window.localStorage.getItem("sampleportal.automation.logs");
    if (savedJobs) {
      try {
        const parsed = JSON.parse(savedJobs) as AutomationJob[];
        if (Array.isArray(parsed)) setJobs(parsed);
      } catch {
        // Ignore malformed payload.
      }
    }
    if (savedRules) {
      try {
        const parsed = JSON.parse(savedRules) as RuleItem[];
        if (Array.isArray(parsed)) setRules(parsed);
      } catch {
        // Ignore malformed payload.
      }
    }
    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs) as string[];
        if (Array.isArray(parsed)) setLogs(parsed);
      } catch {
        // Ignore malformed payload.
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sampleportal.automation.jobs", JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    window.localStorage.setItem("sampleportal.automation.rules", JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    window.localStorage.setItem(
      "sampleportal.automation.logs",
      JSON.stringify(logs.slice(0, 150))
    );
  }, [logs]);

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => {
      const moduleOk = moduleFilter === "ALL" || job.module === moduleFilter;
      const statusOk = statusFilter === "ALL" || job.status === statusFilter;
      return moduleOk && statusOk;
    });
  }, [jobs, moduleFilter, statusFilter]);

  const errorJobs = useMemo(() => jobs.filter((job) => job.status === "ERROR"), [jobs]);
  const activeJobs = useMemo(() => jobs.filter((job) => job.status === "ACTIVE"), [jobs]);

  function appendLog(line: string): void {
    setLogs((current) => [`[${nowLabel()}] ${line}`, ...current].slice(0, 200));
  }

  function toggleJobStatus(id: string): void {
    if (!canEdit) return;
    setJobs((current) =>
      current.map((job) => {
        if (job.id !== id) return job;
        const status: JobStatus = job.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
        appendLog(`${job.name}: status changed to ${status}`);
        return { ...job, status, nextRun: status === "PAUSED" ? "Paused" : "In scheduler queue" };
      })
    );
  }

  function queueRun(job: AutomationJob, forceFail = false): void {
    if (!canEdit) return;
    const queueItem: QueueItem = {
      id: `q_${Math.random().toString(36).slice(2, 9)}`,
      jobId: job.id,
      jobName: job.name,
      priority: job.priority,
      status: forceFail ? "FAILED" : "SUCCESS",
      enqueuedAt: nowLabel(),
    };
    setQueue((current) => [queueItem, ...current].slice(0, 40));
    setJobs((current) =>
      current.map((entry) => {
        if (entry.id !== job.id) return entry;
        const nextStatus: JobStatus = forceFail ? "ERROR" : "ACTIVE";
        const nextErrors = forceFail ? entry.consecutiveErrors + 1 : 0;
        const nextSuccessRate = forceFail
          ? Math.max(20, entry.successRate - 4)
          : Math.min(99, entry.successRate + 1);
        return {
          ...entry,
          status: nextStatus,
          consecutiveErrors: nextErrors,
          successRate: nextSuccessRate,
          lastRun: nowLabel(),
          nextRun: forceFail ? "Retry required" : "In scheduler queue",
        };
      })
    );
    appendLog(`${job.name}: ${forceFail ? "FAILED" : "completed"} via manual run`);
  }

  function retryErrors(): void {
    if (!canEdit) return;
    if (!errorJobs.length) return;
    errorJobs.forEach((job) => queueRun(job, false));
    setNotice(`Retried ${errorJobs.length} failed job(s).`);
  }

  function simulateSchedulerTick(): void {
    if (!canEdit) return;
    if (!activeJobs.length) return;
    const selected = activeJobs[Math.floor(Math.random() * activeJobs.length)];
    const forceFail = Math.random() < 0.2;
    queueRun(selected, forceFail);
    setNotice(`Scheduler tick processed ${selected.name}.`);
  }

  function addRule(): void {
    if (!canEdit) return;
    const next: RuleItem = {
      id: `rule_${Math.random().toString(36).slice(2, 9)}`,
      trigger: ruleTrigger,
      condition: ruleCondition,
      action: ruleAction,
      enabled: true,
    };
    setRules((current) => [next, ...current]);
    appendLog(`Rule added: ${next.trigger} -> ${next.action}`);
    setNotice("Rule added.");
  }

  function toggleRule(id: string): void {
    if (!canEdit) return;
    setRules((current) =>
      current.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  }

  function removeQueueItem(id: string): void {
    if (!canEdit) return;
    setQueue((current) => current.filter((item) => item.id !== id));
  }

  return (
    <>
      <ModuleHeader
        title="Automation & Sync Engine"
        description="Cross-module scheduler demo with queue visibility, retry controls, and rule builder."
        right={
          <>
            <button className="btn" type="button" onClick={simulateSchedulerTick} disabled={!canEdit}>
              Simulate Scheduler Tick
            </button>
            <button className="btn btn-primary" type="button" onClick={retryErrors} disabled={!canEdit || errorJobs.length === 0}>
              Retry Failed Jobs
            </button>
          </>
        }
      />

      {notice ? <div className="alert">{notice}</div> : null}
      {!canEdit ? <div className="alert">Read-only mode for this role.</div> : null}

      <section className="card-grid">
        <StatCard title="Active Jobs" value={number(activeJobs.length)} note="Scheduler-ready jobs" />
        <StatCard title="Errored Jobs" value={number(errorJobs.length)} note="Needs operator action" />
        <StatCard title="Queue Depth" value={number(queue.length)} note="Last 40 queue events" />
        <StatCard title="Rules Enabled" value={number(rules.filter((rule) => rule.enabled).length)} note="Automation rules live" />
      </section>

      <section className="panel">
        <div className="control-row">
          <select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
            <option value="ALL">All Modules</option>
            {Array.from(new Set(jobs.map((job) => job.module))).map((module) => (
              <option key={module} value={module}>
                {module}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PAUSED">PAUSED</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
      </section>

      <section className="split-2">
        <article className="panel">
          <h4>Job Monitor</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Module</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th>Success</th>
                  <th>Errors</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.name}</td>
                    <td>{job.module}</td>
                    <td>
                      <input
                        value={job.schedule}
                        disabled={!canEdit}
                        onChange={(event) =>
                          setJobs((current) =>
                            current.map((entry) =>
                              entry.id === job.id ? { ...entry, schedule: event.target.value } : entry
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <span className={`chip ${job.status === "ACTIVE" ? "auto" : job.status === "PAUSED" ? "warn" : "danger"}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.successRate}%</td>
                    <td>{job.consecutiveErrors}</td>
                    <td>
                      <div className="control-row">
                        <button className="btn" type="button" onClick={() => toggleJobStatus(job.id)} disabled={!canEdit}>
                          {job.status === "ACTIVE" ? "Pause" : "Activate"}
                        </button>
                        <button className="btn" type="button" onClick={() => queueRun(job)} disabled={!canEdit}>
                          Run Now
                        </button>
                        <button className="btn" type="button" onClick={() => queueRun(job, true)} disabled={!canEdit}>
                          Force Fail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h4>Queue & Recent Runs</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Queue empty.</td>
                  </tr>
                ) : (
                  queue.map((item) => (
                    <tr key={item.id}>
                      <td>{item.jobName}</td>
                      <td>{item.priority}</td>
                      <td>
                        <span className={`chip ${item.status === "SUCCESS" ? "auto" : item.status === "FAILED" ? "danger" : "warn"}`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.enqueuedAt}</td>
                      <td>
                        <button className="btn" type="button" onClick={() => removeQueueItem(item.id)} disabled={!canEdit}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="split-2">
        <article className="panel form-grid">
          <h4>Rule Builder</h4>
          <label>
            Trigger
            <input value={ruleTrigger} onChange={(event) => setRuleTrigger(event.target.value)} disabled={!canEdit} />
          </label>
          <label>
            Condition
            <input value={ruleCondition} onChange={(event) => setRuleCondition(event.target.value)} disabled={!canEdit} />
          </label>
          <label>
            Action
            <textarea rows={3} value={ruleAction} onChange={(event) => setRuleAction(event.target.value)} disabled={!canEdit} />
          </label>
          <button className="btn btn-primary" type="button" onClick={addRule} disabled={!canEdit}>
            Add Rule
          </button>
        </article>

        <article className="panel">
          <h4>Rules</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Trigger</th>
                  <th>Condition</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.trigger}</td>
                    <td>{rule.condition}</td>
                    <td>{rule.action}</td>
                    <td>
                      <button className="btn" type="button" onClick={() => toggleRule(rule.id)} disabled={!canEdit}>
                        <span className={`chip ${rule.enabled ? "auto" : "warn"}`}>
                          {rule.enabled ? "ENABLED" : "DISABLED"}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="panel">
        <h4>System Log</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <tbody>
              {logs.slice(0, 30).map((line, index) => (
                <tr key={`${line}-${index}`}>
                  <td>{line}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
