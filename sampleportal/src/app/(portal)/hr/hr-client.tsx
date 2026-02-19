"use client";

import { useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";

interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
}

const seedLinks: LinkItem[] = [
  {
    id: "h1",
    title: "Hubstaff",
    description: "Time tracking, screenshots, and activity monitoring",
    url: "https://app.hubstaff.com",
    category: "Time Tracking",
  },
  {
    id: "h2",
    title: "Clockify",
    description: "Timesheet and payroll-hour tracking",
    url: "https://app.clockify.me",
    category: "Time Tracking",
  },
];

export function HrClient({ canEdit }: { canEdit: boolean }) {
  const [links, setLinks] = useState(seedLinks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("https://");

  return (
    <>
      <ModuleHeader title="HR Links" description="Fast access to team HR and operations tools." />

      <section className="card-grid">
        <StatCard title="Total Links" value={String(links.length)} note="Available tools" />
        <StatCard title="Categories" value={String(new Set(links.map((item) => item.category)).size)} note="Grouped collections" />
        <StatCard title="Editable" value={canEdit ? "Yes" : "No"} note="Based on role" />
        <StatCard title="Pinned" value="2" note="Hubstaff + Clockify" />
      </section>

      <section className="split-2">
        <article className="panel form-grid">
          <h4>Add Link</h4>
          <input placeholder="Title" value={title} disabled={!canEdit} onChange={(event) => setTitle(event.target.value)} />
          <input placeholder="URL" value={url} disabled={!canEdit} onChange={(event) => setUrl(event.target.value)} />
          <button
            className="btn"
            type="button"
            disabled={!canEdit}
            onClick={() => {
              if (!title.trim() || !url.trim()) return;
              setLinks((current) => [
                ...current,
                {
                  id: `h_${Date.now()}`,
                  title: title.trim(),
                  description: "Custom link",
                  url: url.trim(),
                  category: "General",
                },
              ]);
              setTitle("");
              setUrl("https://");
            }}
          >
            Add Link
          </button>
        </article>

        <article className="panel">
          <h4>Link Library</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Open</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {links.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.description}</td>
                    <td>{item.category}</td>
                    <td>
                      <a className="btn" href={item.url} target="_blank" rel="noreferrer">
                        Open
                      </a>
                    </td>
                    <td>
                      <button
                        className="btn"
                        type="button"
                        disabled={!canEdit}
                        onClick={() => setLinks((current) => current.filter((entry) => entry.id !== item.id))}
                      >
                        Remove
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
