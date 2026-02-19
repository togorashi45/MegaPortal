"use client";

import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

interface TaskCard {
  id: string;
  title: string;
  assignee: string;
  due: string;
  labels: string[];
}

interface Column {
  id: string;
  title: string;
  cards: TaskCard[];
}

const seedColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "t1", title: "Finalize KPI walkthrough script", assignee: "Jake", due: "2026-02-20", labels: ["KPI"] },
      { id: "t2", title: "Seed wiki SOP starter pages", assignee: "Ian", due: "2026-02-22", labels: ["Wiki"] },
    ],
  },
  {
    id: "doing",
    title: "In Progress",
    cards: [
      { id: "t3", title: "Build sample portal auth + shell", assignee: "Jake", due: "2026-02-19", labels: ["Core"] },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [
      { id: "t4", title: "Collect PRDs and brand docs", assignee: "Jake", due: "2026-02-18", labels: ["Planning"] },
    ],
  },
];

export function TasksClient({ canEdit, currentUser }: { canEdit: boolean; currentUser: string }) {
  const [columns, setColumns] = useState(seedColumns);
  const [newTitle, setNewTitle] = useState("");

  const totalCards = useMemo(
    () => columns.reduce((acc, column) => acc + column.cards.length, 0),
    [columns]
  );

  function moveCard(cardId: string, direction: "left" | "right"): void {
    setColumns((current) => {
      const sourceIndex = current.findIndex((column) => column.cards.some((card) => card.id === cardId));
      if (sourceIndex < 0) return current;

      const targetIndex = direction === "left" ? sourceIndex - 1 : sourceIndex + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const source = current[sourceIndex];
      const card = source.cards.find((entry) => entry.id === cardId);
      if (!card) return current;

      return current.map((column, index) => {
        if (index === sourceIndex) {
          return { ...column, cards: column.cards.filter((entry) => entry.id !== cardId) };
        }
        if (index === targetIndex) {
          return { ...column, cards: [...column.cards, card] };
        }
        return column;
      });
    });
  }

  function addCard(): void {
    if (!newTitle.trim()) return;
    setColumns((current) =>
      current.map((column) =>
        column.id === "todo"
          ? {
              ...column,
              cards: [
                ...column.cards,
                {
                  id: `t_${Date.now()}`,
                  title: newTitle.trim(),
                  assignee: currentUser,
                  due: new Date().toISOString().slice(0, 10),
                  labels: ["General"],
                },
              ],
            }
          : column
      )
    );
    setNewTitle("");
  }

  return (
    <>
      <ModuleHeader
        title="Kanban Task Manager"
        description="ClickUp replacement with sample drag-flow controls."
        right={
          <>
            <input
              placeholder="Quick add task"
              value={newTitle}
              disabled={!canEdit}
              onChange={(event) => setNewTitle(event.target.value)}
            />
            <button className="btn" type="button" disabled={!canEdit} onClick={addCard}>
              Add Task
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Boards" value="1" note="Core operations board" />
        <StatCard title="Columns" value={String(columns.length)} note="To Do, In Progress, Done" />
        <StatCard title="Total Cards" value={String(totalCards)} note="Live sample cards" />
        <StatCard title="My Open Cards" value={String(columns.flatMap((c) => c.cards).filter((c) => c.assignee === currentUser).length)} note={currentUser} />
      </section>

      <section className="split-3">
        {columns.map((column, idx) => (
          <article className="panel" key={column.id}>
            <h4>{column.title}</h4>
            <div className="form-grid" style={{ marginTop: 8 }}>
              {column.cards.map((card) => (
                <div key={card.id} className="panel" style={{ background: "#fff" }}>
                  <strong>{card.title}</strong>
                  <p className="muted" style={{ marginTop: 4 }}>
                    {card.assignee} • due {card.due}
                  </p>
                  <p className="muted" style={{ marginTop: 4 }}>
                    {card.labels.join(", ")}
                  </p>
                  <div className="control-row" style={{ marginTop: 8 }}>
                    <button className="btn" type="button" disabled={!canEdit || idx === 0} onClick={() => moveCard(card.id, "left")}>←</button>
                    <button className="btn" type="button" disabled={!canEdit || idx === columns.length - 1} onClick={() => moveCard(card.id, "right")}>→</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
