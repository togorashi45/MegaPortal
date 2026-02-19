"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { money, number } from "@/lib/format";

type Stage = "Acquired" | "Rehab" | "Listed" | "Sold";
type Scenario = "Base" | "Upside" | "Downside";

interface FlipRow {
  id: string;
  project: string;
  stage: Stage;
  purchase: number;
  rehab: number;
  holding: number;
  projectedSale: number;
  closingCosts: number;
  dailyBurn: number;
  daysHeld: number;
  reserve: number;
  updatedAt: string;
}

const seedRows: FlipRow[] = [
  {
    id: "ff_1",
    project: "9602 Cherry Ln, Dallas",
    stage: "Rehab",
    purchase: 193000,
    rehab: 68400,
    holding: 13200,
    projectedSale: 344000,
    closingCosts: 12100,
    dailyBurn: 120,
    daysHeld: 75,
    reserve: 26000,
    updatedAt: "2026-02-19",
  },
  {
    id: "ff_2",
    project: "2809 Leon Dr, Plano",
    stage: "Listed",
    purchase: 171500,
    rehab: 71200,
    holding: 14900,
    projectedSale: 366000,
    closingCosts: 13800,
    dailyBurn: 134,
    daysHeld: 108,
    reserve: 17800,
    updatedAt: "2026-02-18",
  },
  {
    id: "ff_3",
    project: "4307 Wedgewood Ct, Arlington",
    stage: "Acquired",
    purchase: 149000,
    rehab: 49000,
    holding: 9200,
    projectedSale: 272000,
    closingCosts: 9700,
    dailyBurn: 96,
    daysHeld: 31,
    reserve: 36000,
    updatedAt: "2026-02-19",
  },
];

function exportScenario(rows: FlipRow[]): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    rows,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flip-forecasting-snapshot.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function FlipForecastingClient({ canEdit }: { canEdit: boolean }): ReactElement {
  const [rows, setRows] = useState<FlipRow[]>(seedRows);
  const [scenario, setScenario] = useState<Scenario>("Base");
  const [saleDeltaPct, setSaleDeltaPct] = useState(0);
  const [rehabOverrunPct, setRehabOverrunPct] = useState(0);
  const [delayDays, setDelayDays] = useState(0);
  const [message, setMessage] = useState("");
  const [newProject, setNewProject] = useState("New Flip Project");
  const [newStage, setNewStage] = useState<Stage>("Acquired");
  const [newPurchase, setNewPurchase] = useState(165000);
  const [newRehab, setNewRehab] = useState(62000);
  const [newSale, setNewSale] = useState(324000);
  const [newReserve, setNewReserve] = useState(30000);

  useEffect(() => {
    const saved = window.localStorage.getItem("sampleportal.flip-forecasting.advanced");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as FlipRow[];
      if (Array.isArray(parsed)) setRows(parsed);
    } catch {
      // Ignore malformed local state.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sampleportal.flip-forecasting.advanced", JSON.stringify(rows));
  }, [rows]);

  useEffect(() => {
    if (scenario === "Base") {
      setSaleDeltaPct(0);
      setRehabOverrunPct(0);
      setDelayDays(0);
    } else if (scenario === "Upside") {
      setSaleDeltaPct(6);
      setRehabOverrunPct(-4);
      setDelayDays(-10);
    } else {
      setSaleDeltaPct(-8);
      setRehabOverrunPct(12);
      setDelayDays(24);
    }
  }, [scenario]);

  const projectedRows = useMemo(() => {
    return rows.map((row) => {
      const adjustedSale = row.projectedSale * (1 + saleDeltaPct / 100);
      const adjustedRehab = row.rehab * (1 + rehabOverrunPct / 100);
      const adjustedHolding = row.holding + delayDays * row.dailyBurn;
      const totalCost = row.purchase + adjustedRehab + adjustedHolding + row.closingCosts;
      const projectedProfit = adjustedSale - totalCost;
      const marginPct = adjustedSale > 0 ? (projectedProfit / adjustedSale) * 100 : 0;
      const reserveAfter = row.reserve + projectedProfit;
      const risk =
        projectedProfit < 25000 || marginPct < 12 || row.daysHeld + delayDays > 140;
      return {
        ...row,
        adjustedSale,
        adjustedRehab,
        adjustedHolding,
        projectedProfit,
        marginPct,
        reserveAfter,
        risk,
      };
    });
  }, [delayDays, rehabOverrunPct, rows, saleDeltaPct]);

  const totals = useMemo(() => {
    const invested = projectedRows.reduce(
      (sum, row) => sum + row.purchase + row.adjustedRehab + row.adjustedHolding + row.closingCosts,
      0
    );
    const projectedRevenue = projectedRows.reduce((sum, row) => sum + row.adjustedSale, 0);
    const projectedProfit = projectedRows.reduce((sum, row) => sum + row.projectedProfit, 0);
    const riskCount = projectedRows.filter((row) => row.risk).length;
    return { invested, projectedRevenue, projectedProfit, riskCount };
  }, [projectedRows]);

  const alerts = useMemo(
    () =>
      projectedRows
        .filter((row) => row.risk)
        .map((row) => {
          if (row.projectedProfit < 25000) {
            return `${row.project}: projected profit below $25K`;
          }
          if (row.marginPct < 12) {
            return `${row.project}: margin below 12%`;
          }
          return `${row.project}: projected timeline over 140 days`;
        }),
    [projectedRows]
  );

  function updateStage(id: string, stage: Stage): void {
    if (!canEdit) return;
    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, stage, updatedAt: new Date().toISOString().slice(0, 10) } : row
      )
    );
  }

  function addProject(): void {
    if (!canEdit) return;
    const next: FlipRow = {
      id: `ff_${Math.random().toString(36).slice(2, 9)}`,
      project: newProject,
      stage: newStage,
      purchase: newPurchase,
      rehab: newRehab,
      projectedSale: newSale,
      reserve: newReserve,
      holding: 9800,
      closingCosts: 11200,
      dailyBurn: 110,
      daysHeld: 20,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setRows((current) => [next, ...current]);
    setMessage(`Added project: ${next.project}`);
  }

  function resetSeed(): void {
    setRows(seedRows);
    setScenario("Base");
    setMessage("Reset to seeded forecasting dataset.");
  }

  return (
    <>
      <ModuleHeader
        title="Flip Forecasting Dashboard"
        description="Flagship financial forecast demo: portfolio, scenarios, alerts, and per-project P&L."
        right={
          <>
            <button className="btn" type="button" onClick={() => exportScenario(rows)}>
              Export Scenario JSON
            </button>
            <button className="btn" type="button" onClick={resetSeed}>
              Reset Seed Data
            </button>
          </>
        }
      />

      {message ? <div className="alert">{message}</div> : null}
      {!canEdit ? <div className="alert">Read-only mode. Switch to SUPER_ADMIN/ADMIN to edit scenario values.</div> : null}

      <section className="card-grid">
        <StatCard title="Total Invested" value={money(totals.invested)} note="Purchase + rehab + holding + closing" />
        <StatCard title="Projected Revenue" value={money(totals.projectedRevenue)} note={`Scenario: ${scenario}`} />
        <StatCard title="Projected Profit" value={money(totals.projectedProfit)} note={`${projectedRows.length} active projects`} />
        <StatCard title="Risk Flags" value={String(totals.riskCount)} note="Needs immediate review" />
      </section>

      <section className="split-3">
        <article className="panel form-grid">
          <h4>Scenario Planner</h4>
          <label>
            Scenario
            <select value={scenario} onChange={(event) => setScenario(event.target.value as Scenario)}>
              <option>Base</option>
              <option>Upside</option>
              <option>Downside</option>
            </select>
          </label>
          <label>
            Sale Price Shift: {saleDeltaPct}%
            <input type="range" min={-20} max={20} value={saleDeltaPct} onChange={(event) => setSaleDeltaPct(Number(event.target.value))} />
          </label>
          <label>
            Rehab Overrun: {rehabOverrunPct}%
            <input type="range" min={-10} max={30} value={rehabOverrunPct} onChange={(event) => setRehabOverrunPct(Number(event.target.value))} />
          </label>
          <label>
            Hold Delay Days: {delayDays}
            <input type="range" min={-15} max={45} value={delayDays} onChange={(event) => setDelayDays(Number(event.target.value))} />
          </label>
        </article>

        <article className="panel form-grid">
          <h4>Add Project</h4>
          <label>
            Project
            <input value={newProject} onChange={(event) => setNewProject(event.target.value)} disabled={!canEdit} />
          </label>
          <label>
            Stage
            <select value={newStage} onChange={(event) => setNewStage(event.target.value as Stage)} disabled={!canEdit}>
              <option>Acquired</option>
              <option>Rehab</option>
              <option>Listed</option>
              <option>Sold</option>
            </select>
          </label>
          <label>
            Purchase
            <input type="number" value={newPurchase} onChange={(event) => setNewPurchase(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Rehab
            <input type="number" value={newRehab} onChange={(event) => setNewRehab(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Projected Sale
            <input type="number" value={newSale} onChange={(event) => setNewSale(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Reserve
            <input type="number" value={newReserve} onChange={(event) => setNewReserve(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <button className="btn btn-primary" type="button" onClick={addProject} disabled={!canEdit}>
            Add Project
          </button>
        </article>

        <article className="panel">
          <h4>Red Flag Feed</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td>All projects are within forecast guardrails.</td>
                  </tr>
                ) : (
                  alerts.map((alert, index) => (
                    <tr key={`${alert}-${index}`}>
                      <td>{alert}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="panel">
        <h4>Forecast Table</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Stage</th>
                <th>Adjusted Sale</th>
                <th>Total Cost</th>
                <th>Projected Profit</th>
                <th>Margin</th>
                <th>Reserve After Exit</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {projectedRows.map((row) => {
                const totalCost = row.purchase + row.adjustedRehab + row.adjustedHolding + row.closingCosts;
                return (
                  <tr key={row.id}>
                    <td>{row.project}</td>
                    <td>
                      <select value={row.stage} onChange={(event) => updateStage(row.id, event.target.value as Stage)} disabled={!canEdit}>
                        <option>Acquired</option>
                        <option>Rehab</option>
                        <option>Listed</option>
                        <option>Sold</option>
                      </select>
                    </td>
                    <td>{money(row.adjustedSale)}</td>
                    <td>{money(totalCost)}</td>
                    <td>{money(row.projectedProfit)}</td>
                    <td>{row.marginPct.toFixed(1)}%</td>
                    <td>{money(row.reserveAfter)}</td>
                    <td>
                      <span className={`chip ${row.risk ? "danger" : "auto"}`}>{row.risk ? "RED FLAG" : "OK"}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel">
        <h4>Portfolio Stage Summary</h4>
        <div className="card-grid" style={{ marginTop: 8 }}>
          {(["Acquired", "Rehab", "Listed", "Sold"] as Stage[]).map((stage) => (
            <StatCard
              key={stage}
              title={stage}
              value={number(projectedRows.filter((row) => row.stage === stage).length)}
              note="Projects in stage"
            />
          ))}
        </div>
      </article>
    </>
  );
}
