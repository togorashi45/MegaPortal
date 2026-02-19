"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { cloneSeed, loadDemoState, saveDemoState } from "@/lib/demo-storage";
import { money } from "@/lib/format";

type AssetType = "Rental" | "AirBnB" | "Flip" | "Primary Residence";

interface PropertyRow {
  id: string;
  entity: string;
  address: string;
  ownershipPct: number;
  units: number;
  assetType: AssetType;
  marketValue: number;
  mortgageBalance: number;
  mtgPayment: number;
  grossRent: number;
  taxes: number;
  insurance: number;
}

const initialProperties: PropertyRow[] = [
  {
    id: "reo_1",
    entity: "Two Bel Lometa",
    address: "2800 Lometa, Amarillo TX",
    ownershipPct: 0.55,
    units: 48,
    assetType: "Rental",
    marketValue: 2500000,
    mortgageBalance: 1077000,
    mtgPayment: 5895.69,
    grossRent: 29260,
    taxes: 2258.14,
    insurance: 1769.35,
  },
  {
    id: "reo_2",
    entity: "Two Bel Republic",
    address: "4101 Republic, Amarillo TX",
    ownershipPct: 0.55,
    units: 48,
    assetType: "Rental",
    marketValue: 2500000,
    mortgageBalance: 1238000,
    mtgPayment: 6776.11,
    grossRent: 29330,
    taxes: 2077.43,
    insurance: 1769.35,
  },
  {
    id: "reo_3",
    entity: "Panhandle Home Buyer",
    address: "1605 N Julian, Amarillo TX",
    ownershipPct: 1,
    units: 1,
    assetType: "AirBnB",
    marketValue: 165000,
    mortgageBalance: 114000,
    mtgPayment: 494,
    grossRent: 1800,
    taxes: 226,
    insurance: 210,
  },
  {
    id: "reo_4",
    entity: "Panhandle Home Buyer",
    address: "4213 Clifton Ave, Amarillo TX",
    ownershipPct: 1,
    units: 1,
    assetType: "Rental",
    marketValue: 160000,
    mortgageBalance: 105000,
    mtgPayment: 815,
    grossRent: 1125,
    taxes: 220,
    insurance: 85,
  },
];

const STORAGE_KEY = "sampleportal.assets.state";

export function AssetsClient({ canEdit }: { canEdit: boolean }) {
  const [properties, setProperties] = useState<PropertyRow[]>(cloneSeed(initialProperties));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadDemoState<PropertyRow[]>(STORAGE_KEY, initialProperties);
    setProperties(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDemoState(STORAGE_KEY, properties);
  }, [properties, loaded]);

  const totals = useMemo(() => {
    const value = properties.reduce((acc, row) => acc + row.marketValue, 0);
    const debt = properties.reduce((acc, row) => acc + row.mortgageBalance, 0);
    const equity = value - debt;
    const ownedEquity = properties.reduce(
      (acc, row) => acc + (row.marketValue - row.mortgageBalance) * row.ownershipPct,
      0
    );
    const monthlyNet = properties.reduce(
      (acc, row) => acc + (row.grossRent - row.mtgPayment - row.taxes - row.insurance),
      0
    );
    const units = properties.reduce((acc, row) => acc + row.units, 0);
    return { value, debt, equity, ownedEquity, monthlyNet, units };
  }, [properties]);

  function updateRow(id: string, patch: Partial<PropertyRow>): void {
    if (!canEdit) return;
    setProperties((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  function addRow(): void {
    if (!canEdit) return;
    setProperties((current) => [
      ...current,
      {
        id: `reo_${Math.random().toString(36).slice(2, 9)}`,
        entity: "New Entity",
        address: "New Address",
        ownershipPct: 1,
        units: 1,
        assetType: "Rental",
        marketValue: 0,
        mortgageBalance: 0,
        mtgPayment: 0,
        grossRent: 0,
        taxes: 0,
        insurance: 0,
      },
    ]);
  }

  function removeRow(id: string): void {
    if (!canEdit) return;
    setProperties((current) => current.filter((row) => row.id !== id));
  }

  function resetSampleData(): void {
    if (!canEdit) return;
    setProperties(cloneSeed(initialProperties));
  }

  return (
    <>
      <ModuleHeader
        title="REO Schedule & PFS Tracker"
        description="Entity-level assets with ownership %, debt, equity, rents, taxes, and insurance."
        right={
          <>
            <button className="btn" type="button" disabled={!canEdit} onClick={addRow}>
              Add Asset
            </button>
            <button className="btn" type="button" disabled={!canEdit} onClick={resetSampleData}>
              Reset Sample Data
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Total Asset Value" value={money(totals.value)} note="Portfolio market value" />
        <StatCard title="Total Debt" value={money(totals.debt)} note="Mortgage balances" />
        <StatCard title="Net Equity" value={money(totals.equity)} note="Value minus debt" />
        <StatCard title="Owned Equity" value={money(totals.ownedEquity)} note="Adjusted by % ownership" />
        <StatCard title="Monthly Net Cash" value={money(totals.monthlyNet)} note="Gross rent - mtg - taxes - insurance" />
        <StatCard title="Total Doors" value={String(totals.units)} note="Unit count" />
      </section>

      <article className="panel">
        <h4>Asset Schedule</h4>
        {!canEdit ? (
          <div className="alert" style={{ marginTop: 8 }}>
            Read-only: SUPER_ADMIN required for edits.
          </div>
        ) : null}
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Address</th>
                <th>Type</th>
                <th>% Own</th>
                <th>Units</th>
                <th>Value</th>
                <th>Mortgage</th>
                <th>Equity</th>
                <th>Owned Equity</th>
                <th>Mtg Pmt</th>
                <th>Gross Rent</th>
                <th>Taxes</th>
                <th>Insurance</th>
                <th>Net Cash</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((row) => {
                const equity = row.marketValue - row.mortgageBalance;
                const ownedEquity = equity * row.ownershipPct;
                const netCash = row.grossRent - row.mtgPayment - row.taxes - row.insurance;

                return (
                  <tr key={row.id}>
                    <td>
                      <input
                        value={row.entity}
                        disabled={!canEdit}
                        onChange={(event) => updateRow(row.id, { entity: event.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        value={row.address}
                        disabled={!canEdit}
                        onChange={(event) => updateRow(row.id, { address: event.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        value={row.assetType}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { assetType: event.target.value as AssetType })
                        }
                      >
                        <option>Rental</option>
                        <option>AirBnB</option>
                        <option>Flip</option>
                        <option>Primary Residence</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.ownershipPct}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { ownershipPct: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.units}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { units: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.marketValue}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { marketValue: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.mortgageBalance}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { mortgageBalance: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>{money(equity)}</td>
                    <td>{money(ownedEquity)}</td>
                    <td>
                      <input
                        type="number"
                        value={row.mtgPayment}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { mtgPayment: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.grossRent}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { grossRent: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.taxes}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { taxes: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.insurance}
                        disabled={!canEdit}
                        onChange={(event) =>
                          updateRow(row.id, { insurance: Number(event.target.value || 0) })
                        }
                      />
                    </td>
                    <td>{money(netCash)}</td>
                    <td>
                      <button className="btn" type="button" disabled={!canEdit} onClick={() => removeRow(row.id)}>
                        Remove
                      </button>
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
