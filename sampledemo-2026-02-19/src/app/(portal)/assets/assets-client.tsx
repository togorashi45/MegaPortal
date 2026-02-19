"use client";

import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { money } from "@/lib/format";

interface PropertyRow {
  id: string;
  address: string;
  marketValue: number;
  mortgageBalance: number;
  status: "Performing" | "Vacant" | "Disposition";
}

const initialProperties: PropertyRow[] = [
  { id: "p1", address: "1834 Clover Ridge, Phoenix AZ", marketValue: 485000, mortgageBalance: 296000, status: "Performing" },
  { id: "p2", address: "918 Oak Hill Dr, Dallas TX", marketValue: 362000, mortgageBalance: 241000, status: "Vacant" },
  { id: "p3", address: "73 Willow Landing, Tampa FL", marketValue: 528000, mortgageBalance: 315000, status: "Performing" },
  { id: "p4", address: "414 Harbor Lane, Boise ID", marketValue: 299000, mortgageBalance: 184000, status: "Disposition" },
];

export function AssetsClient({ canEdit }: { canEdit: boolean }) {
  const [properties, setProperties] = useState(initialProperties);

  const totals = useMemo(() => {
    const value = properties.reduce((acc, row) => acc + row.marketValue, 0);
    const debt = properties.reduce((acc, row) => acc + row.mortgageBalance, 0);
    const equity = value - debt;
    return { value, debt, equity };
  }, [properties]);

  return (
    <>
      <ModuleHeader
        title="Net Worth & Asset Tracker"
        description="SUPER_ADMIN-only financial module (sample values, editable for demo)."
      />

      <section className="card-grid">
        <StatCard title="Portfolio Value" value={money(totals.value)} note="Real estate market value" />
        <StatCard title="Total Debt" value={money(totals.debt)} note="Outstanding mortgage balances" />
        <StatCard title="Total Equity" value={money(totals.equity)} note="Value minus debt" />
        <StatCard title="Properties" value={String(properties.length)} note="Tracked assets" />
      </section>

      <article className="panel">
        <h4>REO Schedule</h4>
        {!canEdit ? <div className="alert" style={{ marginTop: 8 }}>Read-only: SUPER_ADMIN required for edits.</div> : null}
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Market Value</th>
                <th>Mortgage Balance</th>
                <th>Equity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((row) => {
                const equity = row.marketValue - row.mortgageBalance;
                return (
                  <tr key={row.id}>
                    <td>
                      <input
                        value={row.address}
                        disabled={!canEdit}
                        onChange={(event) =>
                          setProperties((current) =>
                            current.map((entry) =>
                              entry.id === row.id ? { ...entry, address: event.target.value } : entry
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.marketValue}
                        disabled={!canEdit}
                        onChange={(event) =>
                          setProperties((current) =>
                            current.map((entry) =>
                              entry.id === row.id ? { ...entry, marketValue: Number(event.target.value) } : entry
                            )
                          )
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.mortgageBalance}
                        disabled={!canEdit}
                        onChange={(event) =>
                          setProperties((current) =>
                            current.map((entry) =>
                              entry.id === row.id ? { ...entry, mortgageBalance: Number(event.target.value) } : entry
                            )
                          )
                        }
                      />
                    </td>
                    <td>{money(equity)}</td>
                    <td>
                      <select
                        value={row.status}
                        disabled={!canEdit}
                        onChange={(event) =>
                          setProperties((current) =>
                            current.map((entry) =>
                              entry.id === row.id
                                ? { ...entry, status: event.target.value as PropertyRow["status"] }
                                : entry
                            )
                          )
                        }
                      >
                        <option>Performing</option>
                        <option>Vacant</option>
                        <option>Disposition</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </article>
    </>
  );
}
