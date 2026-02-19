"use client";

import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

interface TrainingItem {
  id: string;
  title: string;
  category: string;
  type: "VIDEO" | "DOCUMENT" | "LINK";
  url: string;
  required: boolean;
  completedBy: string[];
}

const seedItems: TrainingItem[] = [
  { id: "tr1", title: "Sales Objection Handling", category: "Sales", type: "VIDEO", url: "https://youtube.com", required: true, completedBy: ["Jake"] },
  { id: "tr2", title: "CRM Pipeline SOP", category: "Operations", type: "DOCUMENT", url: "https://drive.google.com", required: true, completedBy: ["Jake", "Ian"] },
  { id: "tr3", title: "Content Repurposing Playbook", category: "Marketing", type: "LINK", url: "https://example.com", required: false, completedBy: [] },
];

export function TrainingClient({ canEdit, userName }: { canEdit: boolean; userName: string }) {
  const [items, setItems] = useState(seedItems);
  const [title, setTitle] = useState("");

  const completed = useMemo(
    () => items.filter((item) => item.completedBy.includes(userName)).length,
    [items, userName]
  );

  return (
    <>
      <ModuleHeader
        title="Training Hub"
        description="Centralized training library with completion tracking."
      />

      <section className="card-grid">
        <StatCard title="Training Items" value={String(items.length)} note="Published resources" />
        <StatCard title="Completed by Me" value={String(completed)} note={userName} />
        <StatCard title="Required" value={String(items.filter((item) => item.required).length)} note="Must-complete resources" />
        <StatCard title="Optional" value={String(items.filter((item) => !item.required).length)} note="Additional learning" />
      </section>

      <section className="split-2">
        <article className="panel form-grid">
          <h4>Add Training Item</h4>
          <input placeholder="Title" value={title} disabled={!canEdit} onChange={(event) => setTitle(event.target.value)} />
          <button
            className="btn"
            type="button"
            disabled={!canEdit}
            onClick={() => {
              if (!title.trim()) return;
              setItems((current) => [
                ...current,
                {
                  id: `tr_${Date.now()}`,
                  title: title.trim(),
                  category: "General",
                  type: "LINK",
                  url: "https://example.com",
                  required: false,
                  completedBy: [],
                },
              ]);
              setTitle("");
            }}
          >
            Add
          </button>
        </article>

        <article className="panel">
          <h4>Library</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const done = item.completedBy.includes(userName);
                  return (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.type}</td>
                      <td>{item.required ? "Yes" : "No"}</td>
                      <td>{done ? <span className="chip auto">Complete</span> : <span className="chip warn">Not complete</span>}</td>
                      <td className="control-row">
                        <button
                          className="btn"
                          type="button"
                          onClick={() =>
                            setItems((current) =>
                              current.map((entry) => {
                                if (entry.id !== item.id) return entry;
                                const exists = entry.completedBy.includes(userName);
                                return {
                                  ...entry,
                                  completedBy: exists
                                    ? entry.completedBy.filter((name) => name !== userName)
                                    : [...entry.completedBy, userName],
                                };
                              })
                            )
                          }
                        >
                          {done ? "Mark Incomplete" : "Mark Complete"}
                        </button>
                        <a className="btn" href={item.url} target="_blank" rel="noreferrer">Open</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}
