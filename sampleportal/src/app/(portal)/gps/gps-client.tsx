"use client";

import { useEffect, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { cloneSeed, loadDemoState, saveDemoState } from "@/lib/demo-storage";

interface StandardRow {
  text: string;
  status: string;
}

interface GpsState {
  goal: string;
  priorities: string[];
  standards: StandardRow[];
}

const STORAGE_KEY = "sampleportal.gps.state";
const seedGoal = "Close 120 high-quality deals in 2026 with >35% gross margin.";
const seedPriorities = [
  "Scale lead quality while controlling CPL",
  "Increase sales conversion rate to 18%+",
  "Tighten operational SOP adoption across team",
];
const seedStandards: StandardRow[] = [
  { text: "Daily KPI update by 9:00 AM", status: "ON_TRACK" },
  { text: "Lead follow-up within 24 hours", status: "ON_TRACK" },
  { text: "Weekly team GPS review", status: "NEEDS_ATTENTION" },
];

const initialState: GpsState = {
  goal: seedGoal,
  priorities: seedPriorities,
  standards: seedStandards,
};

export function GpsClient({ canEdit, owner }: { canEdit: boolean; owner: string }) {
  const [goal, setGoal] = useState(seedGoal);
  const [priorities, setPriorities] = useState<string[]>(cloneSeed(seedPriorities));
  const [standards, setStandards] = useState<StandardRow[]>(cloneSeed(seedStandards));
  const [newPriority, setNewPriority] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadDemoState<GpsState>(STORAGE_KEY, initialState);
    setGoal(saved.goal);
    setPriorities(saved.priorities);
    setStandards(saved.standards);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDemoState<GpsState>(STORAGE_KEY, { goal, priorities, standards });
  }, [goal, priorities, standards, loaded]);

  function resetSampleData(): void {
    if (!canEdit) return;
    setGoal(seedGoal);
    setPriorities(cloneSeed(seedPriorities));
    setStandards(cloneSeed(seedStandards));
    setNewPriority("");
  }

  return (
    <>
      <ModuleHeader
        title="GPS Framework"
        description="Goal, Priorities, Standards alignment module."
        right={
          <button className="btn" type="button" disabled={!canEdit} onClick={resetSampleData}>
            Reset Sample Data
          </button>
        }
      />

      <section className="card-grid">
        <StatCard title="Owner" value={owner} note="Current profile" />
        <StatCard title="Priorities" value={String(priorities.length)} note="Active priorities" />
        <StatCard title="Standards" value={String(standards.length)} note="Tracked standards" />
        <StatCard
          title="Needs Attention"
          value={String(standards.filter((item) => item.status === "NEEDS_ATTENTION").length)}
          note="Status indicators"
        />
      </section>

      <section className="split-2">
        <article className="panel form-grid">
          <h4>Goal</h4>
          <textarea
            rows={4}
            value={goal}
            disabled={!canEdit}
            onChange={(event) => setGoal(event.target.value)}
          />
          <p className="muted">Single overarching outcome for the period.</p>
        </article>

        <article className="panel form-grid">
          <h4>Priorities</h4>
          <div className="form-grid">
            {priorities.map((item, index) => (
              <div key={`${item}-${index}`} style={{ display: "flex", gap: 8 }}>
                <input
                  value={item}
                  disabled={!canEdit}
                  onChange={(event) =>
                    setPriorities((current) =>
                      current.map((entry, idx) => (idx === index ? event.target.value : entry))
                    )
                  }
                />
                {canEdit ? (
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setPriorities((current) => current.filter((_, idx) => idx !== index))}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              placeholder="Add priority"
              value={newPriority}
              disabled={!canEdit}
              onChange={(event) => setNewPriority(event.target.value)}
            />
            <button
              className="btn"
              type="button"
              disabled={!canEdit}
              onClick={() => {
                if (!newPriority.trim()) return;
                setPriorities((current) => [...current, newPriority.trim()]);
                setNewPriority("");
              }}
            >
              Add
            </button>
          </div>
        </article>
      </section>

      <article className="panel">
        <h4>Standards Scorecard</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Standard</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {standards.map((item, index) => (
                <tr key={`${item.text}-${index}`}>
                  <td>
                    <input
                      value={item.text}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setStandards((current) =>
                          current.map((entry, idx) =>
                            idx === index ? { ...entry, text: event.target.value } : entry
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={item.status}
                      disabled={!canEdit}
                      onChange={(event) =>
                        setStandards((current) =>
                          current.map((entry, idx) =>
                            idx === index ? { ...entry, status: event.target.value } : entry
                          )
                        )
                      }
                    >
                      <option value="ON_TRACK">On Track</option>
                      <option value="NEEDS_ATTENTION">Needs Attention</option>
                      <option value="OFF_TRACK">Off Track</option>
                    </select>
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
