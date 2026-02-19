"use client";

import { useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

interface EventItem {
  id: string;
  title: string;
  category: string;
  start: string;
  end: string;
  owner: string;
}

const initialEvents: EventItem[] = [
  { id: "e1", title: "Weekly KPI Review", category: "Meeting", start: "2026-02-20 09:00", end: "2026-02-20 10:00", owner: "Jake" },
  { id: "e2", title: "Ad Creative Sprint", category: "Deadline", start: "2026-02-21 17:00", end: "2026-02-21 18:00", owner: "Ian" },
  { id: "e3", title: "New Hire Training", category: "Training", start: "2026-02-22 13:00", end: "2026-02-22 14:00", owner: "Ava" },
];

export function CalendarClient({ canEdit, currentUser }: { canEdit: boolean; currentUser: string }) {
  const [events, setEvents] = useState(initialEvents);
  const [view, setView] = useState("Month");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Meeting");
  const [start, setStart] = useState("2026-02-24 09:00");
  const [end, setEnd] = useState("2026-02-24 09:30");

  const grouped = useMemo(() => {
    return [...events].sort((a, b) => a.start.localeCompare(b.start));
  }, [events]);

  return (
    <>
      <ModuleHeader
        title="Company Calendar"
        description="Shared events module with add/edit sample controls."
        right={
          <>
            <select value={view} onChange={(event) => setView(event.target.value)}>
              <option>Month</option>
              <option>Week</option>
              <option>Day</option>
            </select>
            <span className="chip auto">{view} view</span>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Events" value={String(events.length)} note="Current sample entries" />
        <StatCard title="My Events" value={String(events.filter((event) => event.owner === currentUser).length)} note={currentUser} />
        <StatCard title="Meeting Events" value={String(events.filter((event) => event.category === "Meeting").length)} note="Category count" />
        <StatCard title="Training Events" value={String(events.filter((event) => event.category === "Training").length)} note="Category count" />
      </section>

      <section className="split-2">
        <article className="panel form-grid">
          <h4>Create Event</h4>
          <label htmlFor="ev-title">Title</label>
          <input id="ev-title" value={title} disabled={!canEdit} onChange={(event) => setTitle(event.target.value)} />

          <label htmlFor="ev-cat">Category</label>
          <select id="ev-cat" value={category} disabled={!canEdit} onChange={(event) => setCategory(event.target.value)}>
            <option>Meeting</option>
            <option>Deadline</option>
            <option>Training</option>
            <option>Personal</option>
            <option>Holiday</option>
          </select>

          <label htmlFor="ev-start">Start</label>
          <input id="ev-start" value={start} disabled={!canEdit} onChange={(event) => setStart(event.target.value)} />

          <label htmlFor="ev-end">End</label>
          <input id="ev-end" value={end} disabled={!canEdit} onChange={(event) => setEnd(event.target.value)} />

          <button
            className="btn"
            type="button"
            disabled={!canEdit}
            onClick={() => {
              if (!title.trim()) return;
              setEvents((current) => [
                ...current,
                {
                  id: `e_${Date.now()}`,
                  title: title.trim(),
                  category,
                  start,
                  end,
                  owner: currentUser,
                },
              ]);
              setTitle("");
            }}
          >
            Add Event
          </button>
        </article>

        <article className="panel">
          <h4>Event List</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Owner</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {grouped.map((event) => (
                  <tr key={event.id}>
                    <td>{event.title}</td>
                    <td>{event.category}</td>
                    <td>{event.start}</td>
                    <td>{event.end}</td>
                    <td>{event.owner}</td>
                    <td>
                      <button
                        className="btn"
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  );
}
