"use client";

import { useEffect, useMemo, useState } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { cloneSeed, loadDemoState, saveDemoState } from "@/lib/demo-storage";

interface WikiPage {
  id: string;
  title: string;
  space: string;
  content: string;
  updatedAt: string;
}

const initialPages: WikiPage[] = [
  {
    id: "w1",
    title: "Sales Call SOP",
    space: "Operations",
    content: "# Sales Call SOP\n\n1. Open with context\n2. Clarify pain\n3. Present offer\n4. Confirm next step",
    updatedAt: "2026-02-18",
  },
  {
    id: "w2",
    title: "KPI Definitions",
    space: "Leadership",
    content: "# KPI Definitions\n\n- Revenue Collected\n- Lead Volume\n- CPL\n- Conversion Rate",
    updatedAt: "2026-02-18",
  },
  {
    id: "w3",
    title: "Onboarding Checklist",
    space: "People",
    content: "# Onboarding\n\n- Account setup\n- Tool access\n- Shadow sessions\n- 30-day goals",
    updatedAt: "2026-02-17",
  },
];

const STORAGE_KEY = "sampleportal.wiki.state";

interface WikiState {
  pages: WikiPage[];
  selected: string;
}

export function WikiClient({ canEdit }: { canEdit: boolean }) {
  const [pages, setPages] = useState<WikiPage[]>(cloneSeed(initialPages));
  const [selected, setSelected] = useState(initialPages[0]?.id || "");
  const [query, setQuery] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = loadDemoState<WikiState>(STORAGE_KEY, {
      pages: initialPages,
      selected: initialPages[0]?.id || "",
    });
    setPages(saved.pages);
    setSelected(saved.selected || saved.pages[0]?.id || "");
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const selectedExists = pages.some((page) => page.id === selected);
    saveDemoState<WikiState>(STORAGE_KEY, {
      pages,
      selected: selectedExists ? selected : pages[0]?.id || "",
    });
  }, [pages, selected, loaded]);

  const selectedPage = pages.find((page) => page.id === selected);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return pages;
    return pages.filter(
      (page) =>
        page.title.toLowerCase().includes(q) ||
        page.content.toLowerCase().includes(q) ||
        page.space.toLowerCase().includes(q)
    );
  }, [pages, query]);

  function addPage(): void {
    const id = `w_${Date.now()}`;
    const next = {
      id,
      title: "New Page",
      space: "General",
      content: "# New Page\n\nStart writing here...",
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setPages((current) => [next, ...current]);
    setSelected(id);
  }

  function resetSampleData(): void {
    if (!canEdit) return;
    setPages(cloneSeed(initialPages));
    setSelected(initialPages[0]?.id || "");
    setQuery("");
  }

  return (
    <>
      <ModuleHeader
        title="Company Wiki"
        description="Self-hosted documentation hub with editable sample pages."
        right={
          <>
            <input
              placeholder="Search wiki"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="btn" type="button" disabled={!canEdit} onClick={resetSampleData}>
              Reset
            </button>
            <button className="btn" type="button" disabled={!canEdit} onClick={addPage}>
              New Page
            </button>
          </>
        }
      />

      <section className="card-grid">
        <StatCard title="Pages" value={String(pages.length)} note="Total documents" />
        <StatCard title="Spaces" value={String(new Set(pages.map((page) => page.space)).size)} note="Knowledge buckets" />
        <StatCard title="Search Matches" value={String(filtered.length)} note="Current query" />
        <StatCard title="Versioning" value="Enabled" note="Sample edit history" />
      </section>

      <section className="split-2">
        <article className="panel">
          <h4>Page Tree</h4>
          <div className="form-grid" style={{ marginTop: 8 }}>
            {filtered.map((page) => (
              <button
                key={page.id}
                className="btn"
                type="button"
                style={{
                  textAlign: "left",
                  borderColor: page.id === selected ? "var(--brand-orange)" : undefined,
                  background: page.id === selected ? "color-mix(in srgb, var(--brand-gold) 20%, white)" : undefined,
                }}
                onClick={() => setSelected(page.id)}
              >
                <div>
                  <strong>{page.title}</strong>
                  <p className="muted">{page.space} • updated {page.updatedAt}</p>
                </div>
              </button>
            ))}
          </div>
        </article>

        <article className="panel form-grid">
          <h4>Editor</h4>
          {selectedPage ? (
            <>
              <label htmlFor="wiki-title">Title</label>
              <input
                id="wiki-title"
                value={selectedPage.title}
                disabled={!canEdit}
                onChange={(event) =>
                  setPages((current) =>
                    current.map((entry) =>
                      entry.id === selected
                        ? { ...entry, title: event.target.value, updatedAt: new Date().toISOString().slice(0, 10) }
                        : entry
                    )
                  )
                }
              />

              <label htmlFor="wiki-space">Space</label>
              <select
                id="wiki-space"
                value={selectedPage.space}
                disabled={!canEdit}
                onChange={(event) =>
                  setPages((current) =>
                    current.map((entry) =>
                      entry.id === selected
                        ? { ...entry, space: event.target.value, updatedAt: new Date().toISOString().slice(0, 10) }
                        : entry
                    )
                  )
                }
              >
                <option>General</option>
                <option>Operations</option>
                <option>Leadership</option>
                <option>Marketing</option>
                <option>People</option>
              </select>

              <label htmlFor="wiki-content">Content</label>
              <textarea
                id="wiki-content"
                rows={16}
                value={selectedPage.content}
                disabled={!canEdit}
                onChange={(event) =>
                  setPages((current) =>
                    current.map((entry) =>
                      entry.id === selected
                        ? { ...entry, content: event.target.value, updatedAt: new Date().toISOString().slice(0, 10) }
                        : entry
                    )
                  )
                }
              />
            </>
          ) : (
            <p className="muted">Select a page to edit.</p>
          )}
        </article>
      </section>
    </>
  );
}
