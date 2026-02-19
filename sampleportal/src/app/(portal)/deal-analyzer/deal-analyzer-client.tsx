"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { money, number } from "@/lib/format";

type Strategy = "Wholesale" | "Flip" | "Rental";

interface AnalysisRow {
  id: string;
  property: string;
  strategy: Strategy;
  maxOffer: number;
  projectedProfit: number;
  status: "Strong" | "Watch" | "Pass";
  updatedAt: string;
}

const seedComps = [
  { id: "comp1", address: "3221 Austin St", distanceMi: 0.4, sqft: 1680, sold: 339000, daysAgo: 16 },
  { id: "comp2", address: "3415 Knox Ave", distanceMi: 0.7, sqft: 1740, sold: 348500, daysAgo: 22 },
  { id: "comp3", address: "3004 Laurel Dr", distanceMi: 0.8, sqft: 1620, sold: 331000, daysAgo: 29 },
];

const seedHistory: AnalysisRow[] = [
  {
    id: "hist1",
    property: "412 Birch Ave, Fort Worth",
    strategy: "Flip",
    maxOffer: 182600,
    projectedProfit: 69400,
    status: "Strong",
    updatedAt: "2026-02-19",
  },
  {
    id: "hist2",
    property: "932 Pine Dr, Garland",
    strategy: "Wholesale",
    maxOffer: 141200,
    projectedProfit: 22000,
    status: "Watch",
    updatedAt: "2026-02-18",
  },
];

function toStatus(value: number, minimum: number): "Strong" | "Watch" | "Pass" {
  if (value >= minimum) return "Strong";
  if (value >= minimum * 0.65) return "Watch";
  return "Pass";
}

function downloadCsv(rows: AnalysisRow[]): void {
  const header = "property,strategy,max_offer,projected_profit,status,updated_at";
  const body = rows
    .map((row) =>
      [
        row.property,
        row.strategy,
        row.maxOffer.toFixed(0),
        row.projectedProfit.toFixed(0),
        row.status,
        row.updatedAt,
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "deal-analyzer-export.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function DealAnalyzerClient({ canEdit }: { canEdit: boolean }): ReactElement {
  const [property, setProperty] = useState("9602 Cherry Ln, Dallas");
  const [strategy, setStrategy] = useState<Strategy>("Flip");
  const [purchase, setPurchase] = useState(193000);
  const [rehab, setRehab] = useState(68400);
  const [arv, setArv] = useState(344000);
  const [closingCosts, setClosingCosts] = useState(12000);
  const [holdingMonths, setHoldingMonths] = useState(5);
  const [monthlyHolding, setMonthlyHolding] = useState(2400);
  const [otherCosts, setOtherCosts] = useState(6500);
  const [saleCostsPct, setSaleCostsPct] = useState(7);
  const [saleDeltaPct, setSaleDeltaPct] = useState(0);
  const [rehabDeltaPct, setRehabDeltaPct] = useState(0);
  const [monthlyRent, setMonthlyRent] = useState(2850);
  const [occupancyPct, setOccupancyPct] = useState(93);
  const [expensePct, setExpensePct] = useState(34);
  const [annualTaxesInsurance, setAnnualTaxesInsurance] = useState(8900);
  const [loanBalance, setLoanBalance] = useState(165000);
  const [loanRatePct, setLoanRatePct] = useState(9.25);
  const [history, setHistory] = useState<AnalysisRow[]>(seedHistory);
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedComps, setSelectedComps] = useState<string[]>(seedComps.map((comp) => comp.id));

  useEffect(() => {
    const saved = window.localStorage.getItem("sampleportal.deal-analyzer.advanced");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as AnalysisRow[];
      if (Array.isArray(parsed)) setHistory(parsed);
    } catch {
      // Ignore malformed state.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sampleportal.deal-analyzer.advanced", JSON.stringify(history));
  }, [history]);

  const selectedCompRows = useMemo(
    () => seedComps.filter((comp) => selectedComps.includes(comp.id)),
    [selectedComps]
  );

  const avgCompPrice = useMemo(() => {
    if (!selectedCompRows.length) return 0;
    return selectedCompRows.reduce((sum, row) => sum + row.sold, 0) / selectedCompRows.length;
  }, [selectedCompRows]);

  const metrics = useMemo(() => {
    const adjustedSale = arv * (1 + saleDeltaPct / 100);
    const adjustedRehab = rehab * (1 + rehabDeltaPct / 100);
    const totalCost =
      purchase +
      adjustedRehab +
      closingCosts +
      holdingMonths * monthlyHolding +
      otherCosts;
    const netSale = adjustedSale * (1 - saleCostsPct / 100);
    const projectedProfit = netSale - totalCost;
    const maxOffer = adjustedSale * 0.7 - adjustedRehab - otherCosts - closingCosts;
    const wholesaleSpread = adjustedSale * 0.65 - purchase - adjustedRehab;

    const grossRent = monthlyRent * 12 * (occupancyPct / 100);
    const opEx = grossRent * (expensePct / 100) + annualTaxesInsurance;
    const noi = grossRent - opEx;
    const annualDebt = loanBalance * (loanRatePct / 100);
    const cashFlow = noi - annualDebt;
    const capRate = purchase > 0 ? (noi / purchase) * 100 : 0;

    return {
      adjustedSale,
      adjustedRehab,
      totalCost,
      projectedProfit,
      maxOffer,
      wholesaleSpread,
      roi: totalCost > 0 ? (projectedProfit / totalCost) * 100 : 0,
      noi,
      cashFlow,
      capRate,
    };
  }, [
    annualTaxesInsurance,
    arv,
    closingCosts,
    expensePct,
    holdingMonths,
    loanBalance,
    loanRatePct,
    monthlyHolding,
    monthlyRent,
    occupancyPct,
    otherCosts,
    purchase,
    rehab,
    rehabDeltaPct,
    saleCostsPct,
    saleDeltaPct,
  ]);

  const recommendedStatus = useMemo(() => {
    if (strategy === "Rental") {
      return toStatus(metrics.cashFlow, 600);
    }
    if (strategy === "Wholesale") {
      return toStatus(metrics.wholesaleSpread, 18000);
    }
    return toStatus(metrics.projectedProfit, 50000);
  }, [metrics.cashFlow, metrics.projectedProfit, metrics.wholesaleSpread, strategy]);

  function saveAnalysis(): void {
    if (!canEdit) return;
    const row: AnalysisRow = {
      id: `analysis_${Math.random().toString(36).slice(2, 9)}`,
      property,
      strategy,
      maxOffer: metrics.maxOffer,
      projectedProfit:
        strategy === "Wholesale"
          ? metrics.wholesaleSpread
          : strategy === "Rental"
            ? metrics.cashFlow * 12
            : metrics.projectedProfit,
      status: recommendedStatus,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setHistory((current) => [row, ...current].slice(0, 20));
    setSavedMessage(`Saved analysis for ${row.property}`);
  }

  return (
    <>
      <ModuleHeader
        title="Deal Analyzer"
        description="PRD-driven underwriting workbench with scenario controls and strategy-specific outputs."
        right={
          <>
            <button className="btn" type="button" onClick={() => downloadCsv(history)}>
              Export Analyses
            </button>
            <button className="btn btn-primary" type="button" onClick={saveAnalysis} disabled={!canEdit}>
              Save Analysis
            </button>
          </>
        }
      />

      {savedMessage ? <div className="alert">{savedMessage}</div> : null}
      {!canEdit ? <div className="alert">Read-only mode: switch to SUPER_ADMIN/ADMIN to save analyses.</div> : null}

      <section className="card-grid">
        <StatCard title="Recommended Max Offer" value={money(metrics.maxOffer)} note="70% ARV model baseline" />
        <StatCard title="Projected Flip Profit" value={money(metrics.projectedProfit)} note={`ROI ${metrics.roi.toFixed(1)}%`} />
        <StatCard title="Wholesale Spread" value={money(metrics.wholesaleSpread)} note="Buyer spread estimate" />
        <StatCard title="Rental Cash Flow" value={money(metrics.cashFlow)} note={`Cap rate ${metrics.capRate.toFixed(2)}%`} />
      </section>

      <section className="split-3">
        <article className="panel form-grid">
          <h4>Deal Inputs</h4>
          <label>
            Property
            <input value={property} onChange={(event) => setProperty(event.target.value)} disabled={!canEdit} />
          </label>
          <label>
            Strategy
            <select value={strategy} onChange={(event) => setStrategy(event.target.value as Strategy)} disabled={!canEdit}>
              <option>Wholesale</option>
              <option>Flip</option>
              <option>Rental</option>
            </select>
          </label>
          <label>
            Purchase Price
            <input type="number" value={purchase} onChange={(event) => setPurchase(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Rehab Budget
            <input type="number" value={rehab} onChange={(event) => setRehab(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            ARV
            <input type="number" value={arv} onChange={(event) => setArv(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Closing + Transaction Costs
            <input type="number" value={closingCosts} onChange={(event) => setClosingCosts(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
        </article>

        <article className="panel form-grid">
          <h4>Sensitivity Planner</h4>
          <label>
            Sale Price Delta (%)
            <input type="range" min={-15} max={15} value={saleDeltaPct} onChange={(event) => setSaleDeltaPct(Number(event.target.value))} />
            <span className="muted">{saleDeltaPct}%</span>
          </label>
          <label>
            Rehab Delta (%)
            <input type="range" min={-10} max={25} value={rehabDeltaPct} onChange={(event) => setRehabDeltaPct(Number(event.target.value))} />
            <span className="muted">{rehabDeltaPct}%</span>
          </label>
          <label>
            Holding Months
            <input type="number" value={holdingMonths} onChange={(event) => setHoldingMonths(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Monthly Holding Cost
            <input type="number" value={monthlyHolding} onChange={(event) => setMonthlyHolding(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Other Costs
            <input type="number" value={otherCosts} onChange={(event) => setOtherCosts(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Selling Cost (%)
            <input type="number" value={saleCostsPct} onChange={(event) => setSaleCostsPct(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
        </article>

        <article className="panel form-grid">
          <h4>Rental Inputs</h4>
          <label>
            Monthly Rent
            <input type="number" value={monthlyRent} onChange={(event) => setMonthlyRent(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Occupancy (%)
            <input type="number" value={occupancyPct} onChange={(event) => setOccupancyPct(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Expense Ratio (%)
            <input type="number" value={expensePct} onChange={(event) => setExpensePct(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Annual Tax + Insurance
            <input type="number" value={annualTaxesInsurance} onChange={(event) => setAnnualTaxesInsurance(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Loan Balance
            <input type="number" value={loanBalance} onChange={(event) => setLoanBalance(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
          <label>
            Loan Rate (%)
            <input type="number" value={loanRatePct} onChange={(event) => setLoanRatePct(Number(event.target.value || 0))} disabled={!canEdit} />
          </label>
        </article>
      </section>

      <section className="split-2">
        <article className="panel">
          <h4>Selected Comps</h4>
          <p className="muted" style={{ marginTop: 4 }}>
            Average selected comp price: {money(avgCompPrice)}
          </p>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Use</th>
                  <th>Address</th>
                  <th>Distance</th>
                  <th>Sq Ft</th>
                  <th>Sold</th>
                  <th>Days Ago</th>
                </tr>
              </thead>
              <tbody>
                {seedComps.map((comp) => {
                  const checked = selectedComps.includes(comp.id);
                  return (
                    <tr key={comp.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedComps((current) =>
                              checked
                                ? current.filter((id) => id !== comp.id)
                                : [...current, comp.id]
                            )
                          }
                        />
                      </td>
                      <td>{comp.address}</td>
                      <td>{comp.distanceMi.toFixed(1)} mi</td>
                      <td>{number(comp.sqft)}</td>
                      <td>{money(comp.sold)}</td>
                      <td>{comp.daysAgo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel">
          <h4>Decision Output</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <tbody>
                <tr>
                  <th>Adjusted Sale Value</th>
                  <td>{money(metrics.adjustedSale)}</td>
                </tr>
                <tr>
                  <th>Adjusted Rehab</th>
                  <td>{money(metrics.adjustedRehab)}</td>
                </tr>
                <tr>
                  <th>Total Cost Basis</th>
                  <td>{money(metrics.totalCost)}</td>
                </tr>
                <tr>
                  <th>Recommended Max Offer</th>
                  <td>{money(metrics.maxOffer)}</td>
                </tr>
                <tr>
                  <th>Recommendation</th>
                  <td>
                    <span className={`chip ${recommendedStatus === "Strong" ? "auto" : recommendedStatus === "Watch" ? "warn" : "danger"}`}>
                      {recommendedStatus}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <article className="panel">
        <h4>Saved Analyses</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Strategy</th>
                <th>Max Offer</th>
                <th>Projected</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id}>
                  <td>{row.property}</td>
                  <td>{row.strategy}</td>
                  <td>{money(row.maxOffer)}</td>
                  <td>{money(row.projectedProfit)}</td>
                  <td>
                    <span className={`chip ${row.status === "Strong" ? "auto" : row.status === "Watch" ? "warn" : "danger"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
