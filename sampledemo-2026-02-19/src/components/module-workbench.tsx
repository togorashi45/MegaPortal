"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import type { DemoField, DemoModuleConfig, DemoModuleRow } from "@/data/module-demos";

type FormState = Record<string, string>;

function formatCell(value: string | number, format: string | undefined): ReactElement | string {
  if (format === "money" && typeof value === "number") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  }

  if (format === "number" && typeof value === "number") {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
  }

  if (format === "date") {
    if (!value) return "—";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  if (format === "link") {
    const text = String(value || "");
    if (!text) return "—";
    return (
      <a href={text} target="_blank" rel="noreferrer" className="btn">
        Open
      </a>
    );
  }

  return value === "" ? "—" : String(value);
}

function chipClass(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("error") || normalized.includes("overdue") || normalized.includes("default") || normalized.includes("red") || normalized.includes("breach")) {
    return "chip danger";
  }
  if (normalized.includes("watch") || normalized.includes("pending") || normalized.includes("due") || normalized.includes("review") || normalized.includes("tight") || normalized.includes("monitor")) {
    return "chip warn";
  }
  return "chip auto";
}

function buildDefaults(fields: DemoField[]): FormState {
  const state: FormState = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      state[field.key] = String(field.defaultValue);
      continue;
    }
    if (field.type === "select" && field.options && field.options.length > 0) {
      state[field.key] = field.options[0];
      continue;
    }
    state[field.key] = "";
  }
  return state;
}

function parseFieldValue(field: DemoField, raw: string): string | number {
  if (field.type === "number") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return raw.trim();
}

export function ModuleWorkbench({
  config,
  canEdit,
}: {
  config: DemoModuleConfig;
  canEdit: boolean;
}): ReactElement {
  const [rows, setRows] = useState<DemoModuleRow[]>(config.seedRows);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState<FormState>(buildDefaults(config.fields));
  const [loaded, setLoaded] = useState(false);
  const [activity, setActivity] = useState<string[]>([
    "Sample mode active: no external APIs connected.",
  ]);

  useEffect(() => {
    const saved = window.localStorage.getItem(config.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as DemoModuleRow[];
        if (Array.isArray(parsed)) setRows(parsed);
      } catch {
        // Ignore malformed local storage.
      }
    }
    setLoaded(true);
  }, [config.storageKey]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(config.storageKey, JSON.stringify(rows));
  }, [rows, config.storageKey, loaded]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const statusMatch = statusFilter === "ALL" || row.status === statusFilter;
      if (!statusMatch) return false;
      if (!query.trim()) return true;
      const text = Object.values(row).join(" ").toLowerCase();
      return text.includes(query.trim().toLowerCase());
    });
  }, [query, rows, statusFilter]);

  const openCount = useMemo(
    () =>
      rows.filter(
        (row) =>
          !["CLOSED", "COMPLETE", "SOLD", "RESOLVED", "ARCHIVED", "DONE"].includes(
            row.status
          )
      ).length,
    [rows]
  );

  const riskCount = useMemo(
    () =>
      rows.filter((row) => {
        const status = row.status.toLowerCase();
        return status.includes("error") || status.includes("overdue") || status.includes("default") || status.includes("red") || status.includes("breach");
      }).length,
    [rows]
  );

  function resetModule(): void {
    setRows(config.seedRows);
    setForm(buildDefaults(config.fields));
    setActivity((current) => [
      `Reset to seeded sample data at ${new Date().toLocaleTimeString()}.`,
      ...current,
    ]);
  }

  function updateForm(key: string, value: string): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addRow(): void {
    if (!canEdit) return;

    const missing = config.fields.find(
      (field) => field.required && !String(form[field.key] || "").trim()
    );
    if (missing) {
      setActivity((current) => [`Missing required field: ${missing.label}`, ...current]);
      return;
    }

    const record: DemoModuleRow = {
      id: `row_${Math.random().toString(36).slice(2, 9)}`,
      status: String(form.status || config.statusOptions[0] || "OPEN"),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    for (const field of config.fields) {
      record[field.key] = parseFieldValue(field, form[field.key] || "");
    }

    setRows((current) => [record, ...current]);
    setForm(buildDefaults(config.fields));
    setActivity((current) => [`Added new record: ${String(record[config.columns[0]?.key] || record.id)}`, ...current]);
  }

  function duplicateRow(id: string): void {
    if (!canEdit) return;
    setRows((current) => {
      const item = current.find((entry) => entry.id === id);
      if (!item) return current;
      const copy: DemoModuleRow = {
        ...item,
        id: `row_${Math.random().toString(36).slice(2, 9)}`,
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setActivity((history) => [`Duplicated record ${id}.`, ...history]);
      return [copy, ...current];
    });
  }

  function removeRow(id: string): void {
    if (!canEdit) return;
    setRows((current) => current.filter((row) => row.id !== id));
    setActivity((history) => [`Deleted record ${id}.`, ...history]);
  }

  function updateStatus(id: string, status: string): void {
    if (!canEdit) return;
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, status, updatedAt: new Date().toISOString().slice(0, 10) } : row
      )
    );
    setActivity((history) => [`Updated status for ${id} to ${status}.`, ...history]);
  }

  function exportJson(): void {
    const json = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.storageKey}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActivity((history) => [`Exported ${filteredRows.length} records to JSON.`, ...history]);
  }

  return (
    <>
      <ModuleHeader
        title={config.title}
        description={config.description}
        right={
          <>
            <button className="btn" type="button" onClick={resetModule}>
              Reset Sample Data
            </button>
            <button className="btn btn-primary" type="button" onClick={exportJson}>
              Export JSON
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Total Records" value={String(rows.length)} note="Sample dataset rows" />
        <StatCard title={config.metricLabel} value={String(openCount)} note="Needs active attention" />
        <StatCard title="Risk Flags" value={String(riskCount)} note="Error / overdue / red statuses" />
        <StatCard title="Visible Rows" value={String(filteredRows.length)} note="Filtered table count" />
      </section>

      {!canEdit ? (
        <div className="alert">
          Read-only mode for this account. Use SUPER_ADMIN or ADMIN for edits.
        </div>
      ) : null}

      <section className="panel">
        <div className="control-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search records..."
            aria-label="Search records"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="ALL">All Statuses</option>
            {config.statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn" type="button" onClick={() => setQuery("")}>
            Clear Search
          </button>
        </div>
      </section>

      <section className="split-2">
        <article className="panel">
          <h4>Records</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={config.columns.length + 1} className="muted">
                      No records match current filters.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id}>
                      {config.columns.map((column) => {
                        const value = row[column.key] ?? "";
                        if (column.format === "status") {
                          return (
                            <td key={column.key}>
                              <span className={chipClass(String(value))}>{String(value)}</span>
                            </td>
                          );
                        }
                        return <td key={column.key}>{formatCell(value, column.format)}</td>;
                      })}
                      <td>
                        <div className="control-row">
                          <select
                            value={row.status}
                            disabled={!canEdit}
                            onChange={(event) => updateStatus(row.id, event.target.value)}
                          >
                            {config.statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          <button className="btn" type="button" disabled={!canEdit} onClick={() => duplicateRow(row.id)}>
                            Duplicate
                          </button>
                          <button className="btn" type="button" disabled={!canEdit} onClick={() => removeRow(row.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel form-grid">
          <h4>Add Record</h4>
          {config.fields.map((field) => {
            const value = form[field.key] || "";
            if (field.type === "textarea") {
              return (
                <label key={field.key}>
                  {field.label}
                  <textarea
                    rows={3}
                    value={value}
                    disabled={!canEdit}
                    placeholder={field.placeholder}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                  />
                </label>
              );
            }

            if (field.type === "select") {
              return (
                <label key={field.key}>
                  {field.label}
                  <select
                    value={value}
                    disabled={!canEdit}
                    onChange={(event) => updateForm(field.key, event.target.value)}
                  >
                    {(field.options || []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            return (
              <label key={field.key}>
                {field.label}
                <input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
                  value={value}
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  onChange={(event) => updateForm(field.key, event.target.value)}
                />
              </label>
            );
          })}
          <div className="control-row">
            <button className="btn btn-primary" type="button" disabled={!canEdit} onClick={addRow}>
              Add
            </button>
            <button className="btn" type="button" onClick={() => setForm(buildDefaults(config.fields))}>
              Reset Form
            </button>
          </div>
        </article>
      </section>

      <article className="panel">
        <h4>Activity Log</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Recent Actions</th>
              </tr>
            </thead>
            <tbody>
              {activity.slice(0, 12).map((line, index) => (
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
