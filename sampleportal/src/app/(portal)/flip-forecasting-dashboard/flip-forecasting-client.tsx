"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { cloneSeed, loadDemoState, saveDemoState } from "@/lib/demo-storage";
import { money, number } from "@/lib/format";

type Stage = "Acquired" | "Rehab" | "Listed" | "Sold";
type Scenario = "Base" | "Upside" | "Downside";

interface FlipRow {
  id: string;
  flipName: string;
  stage: Stage;
  purchaseDate: string;
  projectedSaleDate: string;
  expectedArv: number;
  loanBalance: number;
  totalSpentToDate: number;
  remainingRehabBudget: number;
  monthlyBurnRate: number;
  upcomingExpenses3mo: number;
  projectedNetProfit: number;
  minimumProfitTarget: number;
  percentOverBudget: number;
  daysBehindSchedule: number;
  updatedAt: string;
}

interface FlipState {
  rows: FlipRow[];
  cashOnHand: number;
}

const STORAGE_KEY = "sampleportal.flip-forecasting.advanced";

const seedRows: FlipRow[] = [
  {
    id: "ff_1",
    flipName: "Flip #1",
    stage: "Rehab",
    purchaseDate: "2025-01-10",
    projectedSaleDate: "2025-04-10",
    expectedArv: 140000,
    loanBalance: 119607.81,
    totalSpentToDate: 130000,
    remainingRehabBudget: 10000,
    monthlyBurnRate: 5000,
    upcomingExpenses3mo: 25000,
    projectedNetProfit: 15000,
    minimumProfitTarget: 19500,
    percentOverBudget: -0.4,
    daysBehindSchedule: 21,
    updatedAt: "2026-02-19",
  },
  {
    id: "ff_2",
    flipName: "Flip #2",
    stage: "Listed",
    purchaseDate: "2025-02-15",
    projectedSaleDate: "2025-05-20",
    expectedArv: 245500,
    loanBalance: 189660.15,
    totalSpentToDate: 189500,
    remainingRehabBudget: 20000,
    monthlyBurnRate: 6500,
    upcomingExpenses3mo: 39500,
    projectedNetProfit: 55500,
    minimumProfitTarget: 28425,
    percentOverBudget: 0,
    daysBehindSchedule: 16,
    updatedAt: "2026-02-18",
  },
  {
    id: "ff_3",
    flipName: "Flip #3",
    stage: "Acquired",
    purchaseDate: "2025-03-01",
    projectedSaleDate: "2025-07-10",
    expectedArv: 126000,
    loanBalance: 69796.7,
    totalSpentToDate: 89000,
    remainingRehabBudget: 21500,
    monthlyBurnRate: 3500,
    upcomingExpenses3mo: 32000,
    projectedNetProfit: 26000,
    minimumProfitTarget: 13350,
    percentOverBudget: 0,
    daysBehindSchedule: 12,
    updatedAt: "2026-02-19",
  },
];

const seedCashOnHand = 98000;

function toDate(input: string): Date {
  const date = new Date(`${input}T12:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function addDays(value: string, days: number): string {
  const date = toDate(value);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeStage(value: unknown): Stage {
  if (value === "Acquired" || value === "Rehab" || value === "Listed" || value === "Sold") {
    return value;
  }
  return "Acquired";
}

function asNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSavedRows(rows: unknown): FlipRow[] {
  if (!Array.isArray(rows)) return cloneSeed(seedRows);

  const normalized = rows
    .map((item, index): FlipRow | null => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;

      if ("flipName" in row) {
        return {
          id: String(row.id || `ff_${index}`),
          flipName: String(row.flipName || `Flip #${index + 1}`),
          stage: normalizeStage(row.stage),
          purchaseDate: String(row.purchaseDate || "2025-01-01"),
          projectedSaleDate: String(row.projectedSaleDate || "2025-06-01"),
          expectedArv: asNumber(row.expectedArv, 0),
          loanBalance: asNumber(row.loanBalance, 0),
          totalSpentToDate: asNumber(row.totalSpentToDate, 0),
          remainingRehabBudget: asNumber(row.remainingRehabBudget, 0),
          monthlyBurnRate: asNumber(row.monthlyBurnRate, 0),
          upcomingExpenses3mo: asNumber(row.upcomingExpenses3mo, 0),
          projectedNetProfit: asNumber(row.projectedNetProfit, 0),
          minimumProfitTarget: asNumber(row.minimumProfitTarget, 0),
          percentOverBudget: asNumber(row.percentOverBudget, 0),
          daysBehindSchedule: asNumber(row.daysBehindSchedule, 0),
          updatedAt: String(row.updatedAt || new Date().toISOString().slice(0, 10)),
        };
      }

      const expectedArv = asNumber(row.projectedSale, 0);
      const purchase = asNumber(row.purchase, 0);
      const rehab = asNumber(row.rehab, 0);
      const holding = asNumber(row.holding, 0);
      const closingCosts = asNumber(row.closingCosts, 0);
      const projectedNetProfit = expectedArv - (purchase + rehab + holding + closingCosts);
      return {
        id: String(row.id || `ff_${index}`),
        flipName: String(row.project || `Flip #${index + 1}`),
        stage: normalizeStage(row.stage),
        purchaseDate: "2025-01-01",
        projectedSaleDate: "2025-06-01",
        expectedArv,
        loanBalance: purchase,
        totalSpentToDate: purchase + rehab + holding,
        remainingRehabBudget: Math.max(0, Math.round(rehab * 0.2)),
        monthlyBurnRate: asNumber(row.dailyBurn, 100) * 30,
        upcomingExpenses3mo: asNumber(row.dailyBurn, 100) * 90,
        projectedNetProfit,
        minimumProfitTarget: 20000,
        percentOverBudget: 0,
        daysBehindSchedule: Math.max(0, asNumber(row.daysHeld, 0) - 90),
        updatedAt: String(row.updatedAt || new Date().toISOString().slice(0, 10)),
      };
    })
    .filter((row): row is FlipRow => row !== null);

  return normalized.length > 0 ? normalized : cloneSeed(seedRows);
}

function exportScenario(rows: FlipRow[], cashOnHand: number): void {
  const payload = {
    exportedAt: new Date().toISOString(),
    cashOnHand,
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
  const [rows, setRows] = useState<FlipRow[]>(cloneSeed(seedRows));
  const [cashOnHand, setCashOnHand] = useState(seedCashOnHand);
  const [scenario, setScenario] = useState<Scenario>("Base");
  const [saleDeltaPct, setSaleDeltaPct] = useState(0);
  const [rehabOverrunPct, setRehabOverrunPct] = useState(0);
  const [delayDays, setDelayDays] = useState(0);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  const [newFlipName, setNewFlipName] = useState("Flip #4");
  const [newStage, setNewStage] = useState<Stage>("Acquired");
  const [newProjectedSale, setNewProjectedSale] = useState(210000);
  const [newLoanBalance, setNewLoanBalance] = useState(152000);
  const [newSpent, setNewSpent] = useState(141000);
  const [newMinimumTarget, setNewMinimumTarget] = useState(25000);

  useEffect(() => {
    const saved = loadDemoState<FlipState>(STORAGE_KEY, {
      rows: seedRows,
      cashOnHand: seedCashOnHand,
    });
    setRows(normalizeSavedRows(saved.rows));
    setCashOnHand(asNumber(saved.cashOnHand, seedCashOnHand));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDemoState<FlipState>(STORAGE_KEY, { rows, cashOnHand });
  }, [rows, cashOnHand, loaded]);

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
      setSaleDeltaPct(-10);
      setRehabOverrunPct(12);
      setDelayDays(24);
    }
  }, [scenario]);

  const projectedRows = useMemo(() => {
    return rows.map((row) => {
      const adjustedArv = row.expectedArv * (1 + saleDeltaPct / 100);
      const adjustedRehab = row.remainingRehabBudget * (1 + rehabOverrunPct / 100);
      const delayCost = delayDays * (row.monthlyBurnRate / 30);
      const adjustedSpent =
        row.totalSpentToDate + adjustedRehab + row.upcomingExpenses3mo + delayCost;
      const scenarioNetProfit =
        row.projectedNetProfit +
        (adjustedArv - row.expectedArv) -
        (adjustedRehab - row.remainingRehabBudget) -
        delayCost;
      const capitalTrapped = Math.max(0, row.expectedArv - row.projectedNetProfit);
      const projectedRevenue3mo = Math.max(
        0,
        scenarioNetProfit - Math.max(0, row.monthlyBurnRate * 3)
      );

      const breakEvenGap = Math.max(0, -scenarioNetProfit);
      const breakEvenDays = Math.ceil(breakEvenGap / Math.max(row.monthlyBurnRate / 30, 1));
      const breakEvenDate = addDays(row.projectedSaleDate, breakEvenDays);

      const targetGap = Math.max(0, row.minimumProfitTarget - scenarioNetProfit);
      const targetDays = Math.ceil(targetGap / Math.max(row.monthlyBurnRate / 30, 1));
      const minProfitTargetDate = addDays(row.projectedSaleDate, targetDays);

      const risk =
        scenarioNetProfit < row.minimumProfitTarget ||
        row.percentOverBudget > 10 ||
        row.daysBehindSchedule + delayDays > 30;

      return {
        ...row,
        adjustedArv,
        adjustedSpent,
        scenarioNetProfit,
        capitalTrapped,
        projectedRevenue3mo,
        breakEvenDate,
        minProfitTargetDate,
        risk,
      };
    });
  }, [delayDays, rehabOverrunPct, rows, saleDeltaPct]);

  const totals = useMemo(() => {
    const totalLoanBalance = projectedRows.reduce((sum, row) => sum + row.loanBalance, 0);
    const totalExpectedArv = projectedRows.reduce((sum, row) => sum + row.adjustedArv, 0);
    const totalSpent = projectedRows.reduce((sum, row) => sum + row.totalSpentToDate, 0);
    const totalRemainingRehab = projectedRows.reduce(
      (sum, row) => sum + row.remainingRehabBudget,
      0
    );
    const totalBurnRate = projectedRows.reduce((sum, row) => sum + row.monthlyBurnRate, 0);
    const totalProjectedProfit = projectedRows.reduce(
      (sum, row) => sum + row.scenarioNetProfit,
      0
    );
    const totalCapitalTrapped = projectedRows.reduce((sum, row) => sum + row.capitalTrapped, 0);
    const redFlags = projectedRows.filter((row) => row.risk).length;
    return {
      totalLoanBalance,
      totalExpectedArv,
      totalSpent,
      totalRemainingRehab,
      totalBurnRate,
      totalProjectedProfit,
      totalCapitalTrapped,
      redFlags,
    };
  }, [projectedRows]);

  const closingBuckets = useMemo(() => {
    const now = new Date();
    let next30 = 0;
    let next60 = 0;
    for (const row of projectedRows) {
      const days = Math.ceil(
        (toDate(row.projectedSaleDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (days >= 0 && days <= 30) next30 += 1;
      if (days > 30 && days <= 60) next60 += 1;
    }
    return { next30, next60 };
  }, [projectedRows]);

  const alerts = useMemo(
    () =>
      projectedRows
        .filter((row) => row.risk)
        .map((row) => {
          if (row.scenarioNetProfit < row.minimumProfitTarget) {
            return `${row.flipName}: projected profit below minimum target (${money(
              row.minimumProfitTarget
            )})`;
          }
          if (row.percentOverBudget > 10) {
            return `${row.flipName}: budget overrun exceeds 10%`;
          }
          return `${row.flipName}: timeline is more than 30 days behind`;
        }),
    [projectedRows]
  );

  const scenarioPlanningRows = useMemo(
    () =>
      rows.map((row) => {
        const arvMinus10 = row.expectedArv * 0.9;
        const arvMinus20 = row.expectedArv * 0.8;
        return {
          id: row.id,
          flipName: row.flipName,
          expectedArv: row.expectedArv,
          totalSpentToDate: row.totalSpentToDate,
          arvMinus10,
          profitMinus10: arvMinus10 - row.totalSpentToDate,
          arvMinus20,
          profitMinus20: arvMinus20 - row.totalSpentToDate,
        };
      }),
    [rows]
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
      flipName: newFlipName,
      stage: newStage,
      purchaseDate: new Date().toISOString().slice(0, 10),
      projectedSaleDate: addDays(new Date().toISOString().slice(0, 10), 120),
      expectedArv: newProjectedSale,
      loanBalance: newLoanBalance,
      totalSpentToDate: newSpent,
      remainingRehabBudget: 18000,
      monthlyBurnRate: 5000,
      upcomingExpenses3mo: 24000,
      projectedNetProfit: newProjectedSale - newSpent,
      minimumProfitTarget: newMinimumTarget,
      percentOverBudget: 0,
      daysBehindSchedule: 0,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setRows((current) => [next, ...current]);
    setMessage(`Added project: ${next.flipName}`);
  }

  function resetSeed(): void {
    if (!canEdit) return;
    setRows(cloneSeed(seedRows));
    setCashOnHand(seedCashOnHand);
    setScenario("Base");
    setMessage("Reset to seeded flip forecasting dataset.");
  }

  return (
    <>
      <ModuleHeader
        title="Flip Forecasting Dashboard"
        description="Spreadsheet-aligned portfolio dashboard, forecasting table, and downside scenario planner."
        right={
          <>
            <button
              className="btn"
              type="button"
              onClick={() => exportScenario(rows, cashOnHand)}
            >
              Export Scenario JSON
            </button>
            <button className="btn" type="button" onClick={resetSeed} disabled={!canEdit}>
              Reset Seed Data
            </button>
          </>
        }
      />

      {message ? <div className="alert">{message}</div> : null}
      {!canEdit ? (
        <div className="alert">Read-only mode. Switch to SUPER_ADMIN/ADMIN to edit values.</div>
      ) : null}

      <section className="card-grid">
        <StatCard title="Current Cash on Hand" value={money(cashOnHand)} note="Portfolio liquidity" />
        <StatCard title="Total Active Flips" value={number(projectedRows.length)} note="Tracked projects" />
        <StatCard title="Total Expected ARV" value={money(totals.totalExpectedArv)} note={`Scenario: ${scenario}`} />
        <StatCard title="Total Loan Balance" value={money(totals.totalLoanBalance)} note="Outstanding debt exposure" />
        <StatCard title="Total Spent To Date" value={money(totals.totalSpent)} note="Capex + holding to date" />
        <StatCard title="Remaining Rehab Budget" value={money(totals.totalRemainingRehab)} note="Budget still open" />
        <StatCard title="Monthly Burn Rate" value={money(totals.totalBurnRate)} note="Current monthly burn" />
        <StatCard title="Projected Net Profit" value={money(totals.totalProjectedProfit)} note="Scenario-adjusted" />
        <StatCard title="Total Capital Trapped" value={money(totals.totalCapitalTrapped)} note="ARV less projected profit" />
        <StatCard title="Closings Next 30 Days" value={number(closingBuckets.next30)} note="Expected sale dates" />
        <StatCard title="Closings 31-60 Days" value={number(closingBuckets.next60)} note="Expected sale dates" />
        <StatCard title="Red Flag Projects" value={number(totals.redFlags)} note="Below target / over budget / delayed" />
      </section>

      <section className="split-3">
        <article className="panel form-grid">
          <h4>Scenario Planner</h4>
          <label>
            Scenario
            <select
              value={scenario}
              onChange={(event) => setScenario(event.target.value as Scenario)}
            >
              <option>Base</option>
              <option>Upside</option>
              <option>Downside</option>
            </select>
          </label>
          <label>
            ARV Shift: {saleDeltaPct}%
            <input
              type="range"
              min={-20}
              max={20}
              value={saleDeltaPct}
              onChange={(event) => setSaleDeltaPct(Number(event.target.value))}
            />
          </label>
          <label>
            Rehab Overrun: {rehabOverrunPct}%
            <input
              type="range"
              min={-10}
              max={30}
              value={rehabOverrunPct}
              onChange={(event) => setRehabOverrunPct(Number(event.target.value))}
            />
          </label>
          <label>
            Delay Days: {delayDays}
            <input
              type="range"
              min={-15}
              max={45}
              value={delayDays}
              onChange={(event) => setDelayDays(Number(event.target.value))}
            />
          </label>
          <label>
            Cash on Hand
            <input
              type="number"
              value={cashOnHand}
              disabled={!canEdit}
              onChange={(event) => setCashOnHand(Number(event.target.value || 0))}
            />
          </label>
        </article>

        <article className="panel form-grid">
          <h4>Add Project</h4>
          <label>
            Flip Name
            <input
              value={newFlipName}
              onChange={(event) => setNewFlipName(event.target.value)}
              disabled={!canEdit}
            />
          </label>
          <label>
            Stage
            <select
              value={newStage}
              onChange={(event) => setNewStage(event.target.value as Stage)}
              disabled={!canEdit}
            >
              <option>Acquired</option>
              <option>Rehab</option>
              <option>Listed</option>
              <option>Sold</option>
            </select>
          </label>
          <label>
            Expected ARV
            <input
              type="number"
              value={newProjectedSale}
              onChange={(event) => setNewProjectedSale(Number(event.target.value || 0))}
              disabled={!canEdit}
            />
          </label>
          <label>
            Loan Balance
            <input
              type="number"
              value={newLoanBalance}
              onChange={(event) => setNewLoanBalance(Number(event.target.value || 0))}
              disabled={!canEdit}
            />
          </label>
          <label>
            Total Spent To Date
            <input
              type="number"
              value={newSpent}
              onChange={(event) => setNewSpent(Number(event.target.value || 0))}
              disabled={!canEdit}
            />
          </label>
          <label>
            Min Profit Target
            <input
              type="number"
              value={newMinimumTarget}
              onChange={(event) => setNewMinimumTarget(Number(event.target.value || 0))}
              disabled={!canEdit}
            />
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
                    <td>All projects are inside configured guardrails.</td>
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
        <h4>Flip Forecasting Table</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Flip Name</th>
                <th>Stage</th>
                <th>Purchase Date</th>
                <th>Projected Sale Date</th>
                <th>Expected ARV</th>
                <th>Loan Balance</th>
                <th>Total Spent</th>
                <th>Remaining Rehab</th>
                <th>Monthly Burn</th>
                <th>Upcoming (3 mos)</th>
                <th>Projected Net Profit</th>
                <th>Capital Trapped</th>
                <th>Projected Rev (3 mos)</th>
                <th>Break-Even Date</th>
                <th>Min Target Date</th>
                <th>% Over Budget</th>
                <th>Days Behind</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {projectedRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.flipName}</td>
                  <td>
                    <select
                      value={row.stage}
                      onChange={(event) => updateStage(row.id, event.target.value as Stage)}
                      disabled={!canEdit}
                    >
                      <option>Acquired</option>
                      <option>Rehab</option>
                      <option>Listed</option>
                      <option>Sold</option>
                    </select>
                  </td>
                  <td>{row.purchaseDate}</td>
                  <td>{row.projectedSaleDate}</td>
                  <td>{money(row.adjustedArv)}</td>
                  <td>{money(row.loanBalance)}</td>
                  <td>{money(row.totalSpentToDate)}</td>
                  <td>{money(row.remainingRehabBudget)}</td>
                  <td>{money(row.monthlyBurnRate)}</td>
                  <td>{money(row.upcomingExpenses3mo)}</td>
                  <td>{money(row.scenarioNetProfit)}</td>
                  <td>{money(row.capitalTrapped)}</td>
                  <td>{money(row.projectedRevenue3mo)}</td>
                  <td>{row.breakEvenDate}</td>
                  <td>{row.minProfitTargetDate}</td>
                  <td>{row.percentOverBudget.toFixed(1)}%</td>
                  <td>{number(row.daysBehindSchedule + delayDays)}</td>
                  <td>
                    <span className={`chip ${row.risk ? "danger" : "auto"}`}>
                      {row.risk ? "RED FLAG" : "OK"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="panel">
        <h4>Scenario Planning (ARV Stress Test)</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Flip Name</th>
                <th>Expected ARV</th>
                <th>Total Spent To Date</th>
                <th>ARV -10%</th>
                <th>Net Profit @ -10%</th>
                <th>ARV -20%</th>
                <th>Net Profit @ -20%</th>
              </tr>
            </thead>
            <tbody>
              {scenarioPlanningRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.flipName}</td>
                  <td>{money(row.expectedArv)}</td>
                  <td>{money(row.totalSpentToDate)}</td>
                  <td>{money(row.arvMinus10)}</td>
                  <td>{money(row.profitMinus10)}</td>
                  <td>{money(row.arvMinus20)}</td>
                  <td>{money(row.profitMinus20)}</td>
                </tr>
              ))}
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
