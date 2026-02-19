"use client";

import { useMemo, useState, type ReactElement } from "react";
import { ModuleHeader } from "@/components/module-header";
import { StatCard } from "@/components/stat-card";
import { contentData, expensesData, inRange, leadData, metaData, NOW, rangeBounds, revenueData, weeklyTargets } from "@/data/kpi-sample";
import { dateLabel, money, number } from "@/lib/format";
import type { DateRangeKey } from "@/types/kpi";

type KpiView =
  | "snapshot"
  | "revenue"
  | "leads"
  | "meta"
  | "content"
  | "expenses"
  | "referrals"
  | "conversions"
  | "settings";

type PaceState = "ok" | "warn" | "danger";

const tabs: Array<{ key: KpiView; label: string }> = [
  { key: "snapshot", label: "Snapshot" },
  { key: "revenue", label: "Revenue" },
  { key: "leads", label: "Leads" },
  { key: "meta", label: "Meta Ads" },
  { key: "content", label: "Content" },
  { key: "expenses", label: "Expenses" },
  { key: "referrals", label: "Referrals" },
  { key: "conversions", label: "Conversions" },
  { key: "settings", label: "Settings" },
];

const initialCampaigns = [
  { id: "c1", name: "Seller Pain Point V3", status: "Active", spend: 186, leads: 10, cpl: 18.6, notes: "Testing new hook", streak: 2 },
  { id: "c2", name: "Case Study Reel", status: "Active", spend: 141, leads: 13, cpl: 10.85, notes: "Strong CTR", streak: 0 },
  { id: "c3", name: "Webinar Retargeting", status: "Paused", spend: 98, leads: 4, cpl: 24.5, notes: "Audience fatigue", streak: 3 },
  { id: "c4", name: "DM Funnel Lead Form", status: "Active", spend: 167, leads: 14, cpl: 11.93, notes: "Stable performer", streak: 0 },
];

const referrers = [
  { name: "Ashley Mason", referrals: 22, conversions: 6, revenue: 29400, payout: 2940, status: "Active" },
  { name: "Chris Long", referrals: 18, conversions: 5, revenue: 24750, payout: 2475, status: "Active" },
  { name: "Nadia Patel", referrals: 16, conversions: 4, revenue: 17800, payout: 1780, status: "Active" },
  { name: "Jordan Tate", referrals: 9, conversions: 2, revenue: 9800, payout: 980, status: "Inactive" },
];

const referralLog = [
  { date: "2026-02-18", referrer: "Ashley Mason", referred: "Ryan W.", offer: "High Ticket", status: "Converted", revenue: 4900, commission: 490 },
  { date: "2026-02-17", referrer: "Chris Long", referred: "Mia S.", offer: "Payment Plan", status: "Converted", revenue: 2500, commission: 250 },
  { date: "2026-02-16", referrer: "Nadia Patel", referred: "Kyle D.", offer: "Community", status: "Pending", revenue: 0, commission: 0 },
  { date: "2026-02-15", referrer: "Ashley Mason", referred: "Lena R.", offer: "High Ticket", status: "Lost", revenue: 0, commission: 0 },
];

const conversions = Array.from({ length: 24 }, (_, index) => {
  const date = new Date(NOW);
  date.setDate(date.getDate() - index);
  const source = ["Paid Ads", "Organic Social", "Referral", "Newsletter", "Prospecting"][index % 5];
  const offer = ["High Ticket", "Payment Plan", "Community"][index % 3];
  const revenue = offer === "High Ticket" ? 4900 : offer === "Payment Plan" ? 2500 : 697;
  return {
    date: date.toISOString().slice(0, 10),
    source,
    offer,
    daysToConvert: Math.max(2, Math.round(8 + Math.sin(index) * 4)),
    path: "Lead Form > Booked Call > Closed",
    revenue,
  };
});

const apiStatuses = [
  { provider: "GoHighLevel", status: "Connected", frequency: "Every 15 min", last: "Feb 19, 2026 4:15 AM" },
  { provider: "Meta Ads", status: "Connected", frequency: "Every 30 min", last: "Feb 19, 2026 4:00 AM" },
  { provider: "QuickBooks", status: "Needs Auth", frequency: "Every 1 hour", last: "Feb 18, 2026 11:00 PM" },
  { provider: "Stripe", status: "Connected", frequency: "Webhooks + hourly", last: "Feb 19, 2026 4:24 AM" },
  { provider: "PayPal", status: "Connected", frequency: "Webhooks + hourly", last: "Feb 19, 2026 4:02 AM" },
  { provider: "Beehiiv", status: "Error", frequency: "Every 1 hour", last: "Feb 19, 2026 3:05 AM" },
];

function sum<T>(rows: T[], key: keyof T): number {
  return rows.reduce((acc, row) => {
    const value = row[key] as unknown;
    return acc + (typeof value === "number" ? value : 0);
  }, 0);
}

function pace(actual: number, target: number): PaceState {
  const ratio = actual / Math.max(target, 1);
  if (ratio >= 1) return "ok";
  if (ratio >= 0.8) return "warn";
  return "danger";
}

function statusChip(status: PaceState): ReactElement {
  return <span className={`chip ${status === "ok" ? "auto" : status === "warn" ? "warn" : "danger"}`}>{status === "ok" ? "On Pace" : status === "warn" ? "Warning" : "Off Pace"}</span>;
}

function csvEscape(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes('"')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function downloadCsv(fileName: string, headers: string[], rows: Array<Array<string | number>>): void {
  const body = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const csv = `${headers.join(",")}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function KpiClient({ canEdit }: { canEdit: boolean }): ReactElement {
  const [view, setView] = useState<KpiView>("snapshot");
  const [range, setRange] = useState<DateRangeKey>("yesterday");
  const [constraint, setConstraint] = useState("Improve ad creative hooks while keeping CPL under $15.");
  const [actions, setActions] = useState([
    { text: "Launch 2 new ad creatives", done: true },
    { text: "Publish 5 short videos", done: false },
    { text: "Follow up on warm leads in 24h", done: true },
    { text: "Review CPL at 3pm daily", done: false },
    { text: "Track objections in CRM notes", done: false },
  ]);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [connections, setConnections] = useState(apiStatuses);

  const revenueRows = useMemo(() => revenueData.filter((row) => inRange(row.date, range)), [range]);
  const leadRows = useMemo(() => leadData.filter((row) => inRange(row.date, range)), [range]);
  const metaRows = useMemo(() => metaData.filter((row) => inRange(row.date, range)), [range]);
  const contentRows = useMemo(() => contentData.filter((row) => inRange(row.date, range)), [range]);

  const expensesRows = useMemo(() => {
    const bounds = rangeBounds(range);
    return expensesData.filter((row) => {
      const date = new Date(`${row.weekEnding}T12:00:00`);
      return date >= bounds.start && date <= bounds.end;
    });
  }, [range]);

  const weekRevenue = revenueData
    .filter((row) => inRange(row.date, "thisWeek"))
    .reduce((acc, row) => acc + row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other, 0);
  const weekLeads = leadData
    .filter((row) => inRange(row.date, "thisWeek"))
    .reduce((acc, row) => acc + row.paidAds + row.organic + row.prospecting + row.facebookGroup + row.referrals + row.newsletter, 0);
  const weekSpend = sum(metaData.filter((row) => inRange(row.date, "thisWeek")), "spend");
  const weekCpl = +(weekSpend / Math.max(weekLeads, 1)).toFixed(2);

  const revenuePace = pace(weekRevenue, weeklyTargets.revenue);
  const leadsPace = pace(weekLeads, weeklyTargets.leads);
  const cplPace: PaceState = weekCpl <= weeklyTargets.cplMax ? "ok" : weekCpl <= 20 ? "warn" : "danger";

  const alerts = [
    revenuePace === "danger" ? "Revenue is off pace." : "",
    leadsPace === "danger" ? "Lead generation is off pace." : "",
    cplPace === "danger" ? "CPL is above $20." : "",
  ].filter(Boolean);

  function exportView(): void {
    if (view === "revenue") {
      downloadCsv(
        `kpi-revenue-${range}.csv`,
        ["date", "high_ticket", "payment_plan", "mrr", "affiliate", "other", "total"],
        revenueRows.map((row) => [
          row.date,
          row.highTicket,
          row.paymentPlan,
          row.mrr,
          row.affiliate,
          row.other,
          row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other,
        ])
      );
      return;
    }

    if (view === "leads") {
      downloadCsv(
        `kpi-leads-${range}.csv`,
        ["date", "paid_ads", "organic", "prospecting", "facebook_group", "referrals", "newsletter", "total"],
        leadRows.map((row) => [
          row.date,
          row.paidAds,
          row.organic,
          row.prospecting,
          row.facebookGroup,
          row.referrals,
          row.newsletter,
          row.paidAds + row.organic + row.prospecting + row.facebookGroup + row.referrals + row.newsletter,
        ])
      );
      return;
    }

    if (view === "meta") {
      downloadCsv(
        `kpi-meta-${range}.csv`,
        ["date", "spend", "impressions", "clicks", "ctr", "leads", "cpl", "registrations"],
        metaRows.map((row) => [row.date, row.spend, row.impressions, row.clicks, row.ctr, row.leads, row.cpl, row.registrations])
      );
      return;
    }

    downloadCsv(
      `kpi-${view}-${range}.csv`,
      ["view", "range", "week_revenue", "week_leads", "week_cpl"],
      [[view, range, weekRevenue, weekLeads, weekCpl]]
    );
  }

  const latestRevenue = revenueRows[revenueRows.length - 1];
  const latestLeads = leadRows[leadRows.length - 1];
  const latestMeta = metaRows[metaRows.length - 1];
  const latestContent = contentRows[contentRows.length - 1];

  const snapshotRevenue = latestRevenue
    ? latestRevenue.highTicket + latestRevenue.paymentPlan + latestRevenue.mrr + latestRevenue.affiliate + latestRevenue.other
    : 0;
  const snapshotLeads = latestLeads
    ? latestLeads.paidAds + latestLeads.organic + latestLeads.prospecting + latestLeads.facebookGroup + latestLeads.referrals + latestLeads.newsletter
    : 0;
  const snapshotSpend = latestMeta?.spend ?? 0;
  const snapshotCpl = +(snapshotSpend / Math.max(snapshotLeads, 1)).toFixed(2);
  const snapshotContent = latestContent
    ? latestContent.newsletter + latestContent.youtubeShorts + latestContent.facebookReels + latestContent.igReels + latestContent.facebookPosts
    : 0;

  function renderSnapshot(): ReactElement {
    return (
      <>
        {alerts.length > 0 ? <div className="alert">Alert: {alerts.join(" ")}</div> : null}

        <section className="card-grid">
          <StatCard title="Revenue Collected" value={money(snapshotRevenue)} note="Yesterday" />
          <StatCard title="Leads Generated" value={number(snapshotLeads)} note="Yesterday" />
          <StatCard title="Ad Spend" value={money(snapshotSpend)} note="Yesterday" />
          <StatCard title="Cost Per Lead" value={`$${snapshotCpl.toFixed(2)}`} note="Spend divided by leads" />
          <StatCard title="Content Pieces" value={number(snapshotContent)} note="Yesterday output" />
        </section>

        <section className="split-2">
          <article className="panel">
            <h4>Weekly Pace Indicators</h4>
            <div className="progress-list" style={{ marginTop: 8 }}>
              {[
                { label: "Revenue pace to $25K", value: `${money(weekRevenue)} / ${money(weeklyTargets.revenue)}`, status: revenuePace, width: Math.min((weekRevenue / weeklyTargets.revenue) * 100, 130) },
                { label: "Lead pace to 100", value: `${number(weekLeads)} / ${weeklyTargets.leads}`, status: leadsPace, width: Math.min((weekLeads / weeklyTargets.leads) * 100, 130) },
                { label: "CPL health to <= $15", value: `$${weekCpl.toFixed(2)} / $${weeklyTargets.cplMax}`, status: cplPace, width: Math.min((weeklyTargets.cplMax / Math.max(weekCpl, 1)) * 100, 100) },
              ].map((item) => (
                <div className="progress-row" key={item.label}>
                  <div className="progress-meta">
                    <span>{item.label}</span>
                    <span>{statusChip(item.status)} {item.value}</span>
                  </div>
                  <div className="progress-track">
                    <div className={`progress-fill ${item.status}`} style={{ width: `${Math.max(1, item.width)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel form-grid">
            <h4>Weekly Constraint & Actions</h4>
            <label htmlFor="constraint">Current #1 Constraint</label>
            <textarea
              id="constraint"
              rows={4}
              value={constraint}
              disabled={!canEdit}
              onChange={(event) => setConstraint(event.target.value)}
            />
            <div className="form-grid">
              {actions.map((item, index) => (
                <label key={`${item.text}-${index}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={!canEdit}
                    onChange={() =>
                      setActions((current) =>
                        current.map((entry, idx) => (idx === index ? { ...entry, done: !entry.done } : entry))
                      )
                    }
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderRevenue(): ReactElement {
    const rows = revenueRows.map((row) => ({ ...row, total: row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other }));
    const total = sum(rows, "total");
    const avg = rows.length ? total / rows.length : 0;
    const daysInMonth = new Date(NOW.getFullYear(), NOW.getMonth() + 1, 0).getDate();

    return (
      <>
        <section className="card-grid">
          <StatCard title="MTD Total" value={money(total)} note="Selected range" />
          <StatCard title="Daily Average" value={money(avg)} note="Revenue/day" />
          <StatCard title="Projected Month-End" value={money(avg * daysInMonth)} note="Average x month days" />
          <StatCard title="Affiliate Share" value={`${((sum(rows, "affiliate") / Math.max(total, 1)) * 100).toFixed(1)}%`} note="Of revenue mix" />
        </section>

        <article className="panel">
          <h4>Daily Revenue Table</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>High Ticket</th>
                  <th>Payment Plan</th>
                  <th>MRR</th>
                  <th>Affiliate</th>
                  <th>Other</th>
                  <th>Total</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((row) => (
                  <tr key={row.date}>
                    <td>{dateLabel(row.date)}</td>
                    <td>{money(row.highTicket)}</td>
                    <td>{money(row.paymentPlan)}</td>
                    <td>{money(row.mrr)}</td>
                    <td>{money(row.affiliate)}</td>
                    <td>{money(row.other)}</td>
                    <td><strong>{money(row.total)}</strong></td>
                    <td>{row.comments ? <span className="chip warn">Hybrid</span> : <span className="chip auto">Auto</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </>
    );
  }

  function renderLeads(): ReactElement {
    const rows = leadRows.map((row) => ({
      ...row,
      total: row.paidAds + row.organic + row.prospecting + row.facebookGroup + row.referrals + row.newsletter,
    }));

    const total = sum(rows, "total");

    return (
      <>
        <section className="card-grid">
          <StatCard title="Total Leads" value={number(total)} note="Selected range" />
          <StatCard title="Paid Ads Share" value={`${((sum(rows, "paidAds") / Math.max(total, 1)) * 100).toFixed(1)}%`} note="Largest source" />
          <StatCard title="Prospecting DMs" value={number(Math.round(sum(rows, "prospecting") * 2.5))} note="Estimated from tracker" />
          <StatCard title="Referral Leads" value={number(sum(rows, "referrals"))} note="From referral tags" />
        </section>

        <article className="panel">
          <h4>Daily Lead Table</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Paid Ads</th>
                  <th>Organic</th>
                  <th>Prospecting</th>
                  <th>FB Group</th>
                  <th>Referrals</th>
                  <th>Newsletter</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((row) => (
                  <tr key={row.date}>
                    <td>{dateLabel(row.date)}</td>
                    <td>{row.paidAds}</td>
                    <td>{row.organic}</td>
                    <td>{row.prospecting}</td>
                    <td>{row.facebookGroup}</td>
                    <td>{row.referrals}</td>
                    <td>{row.newsletter}</td>
                    <td><strong>{row.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </>
    );
  }

  function renderMeta(): ReactElement {
    const avg7 = metaRows.slice(-7);
    const avgCpl = sum(avg7, "cpl") / Math.max(avg7.length, 1);

    return (
      <>
        <section className="card-grid">
          <StatCard title="Avg Daily Spend (7d)" value={money(sum(avg7, "spend") / Math.max(avg7.length, 1))} note="Rolling" />
          <StatCard title="Avg CPL (7d)" value={`$${avgCpl.toFixed(2)}`} note="Target $10-$15" />
          <StatCard title="Avg CTR (7d)" value={`${(sum(avg7, "ctr") / Math.max(avg7.length, 1)).toFixed(2)}%`} note="Red under 1%" />
          <StatCard title="Registrations / day" value={(sum(avg7, "registrations") / Math.max(avg7.length, 1)).toFixed(1)} note="Rolling" />
        </section>

        <section className="split-2">
          <article className="panel">
            <h4>Meta Daily Tracker</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Spend</th>
                    <th>Impr.</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Leads</th>
                    <th>CPL</th>
                  </tr>
                </thead>
                <tbody>
                  {metaRows.slice().reverse().map((row) => (
                    <tr key={row.date}>
                      <td>{dateLabel(row.date)}</td>
                      <td>{money(row.spend)}</td>
                      <td>{number(row.impressions)}</td>
                      <td>{number(row.clicks)}</td>
                      <td>{row.ctr.toFixed(2)}%</td>
                      <td>{row.leads}</td>
                      <td className={row.cpl > 20 ? "alert" : ""}>${row.cpl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h4>Campaign Management</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Status</th>
                    <th>Spend</th>
                    <th>Leads</th>
                    <th>CPL</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td>{campaign.name}</td>
                      <td>
                        <select
                          value={campaign.status}
                          disabled={!canEdit}
                          onChange={(event) =>
                            setCampaigns((current) =>
                              current.map((entry) =>
                                entry.id === campaign.id ? { ...entry, status: event.target.value } : entry
                              )
                            )
                          }
                        >
                          <option value="Active">Active</option>
                          <option value="Paused">Paused</option>
                          <option value="Off">Off</option>
                        </select>
                      </td>
                      <td>{money(campaign.spend)}</td>
                      <td>{campaign.leads}</td>
                      <td>{campaign.cpl.toFixed(2)}</td>
                      <td>
                        <input
                          value={campaign.notes}
                          disabled={!canEdit}
                          onChange={(event) =>
                            setCampaigns((current) =>
                              current.map((entry) =>
                                entry.id === campaign.id ? { ...entry, notes: event.target.value } : entry
                              )
                            )
                          }
                        />
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

  function renderContent(): ReactElement {
    const total = contentRows.reduce((acc, row) => acc + row.newsletter + row.youtubeShorts + row.facebookReels + row.igReels + row.facebookPosts, 0);

    return (
      <>
        <section className="card-grid">
          <StatCard title="Content Pieces" value={number(total)} note="Selected range" />
          <StatCard title="FB Group Messages" value={number(sum(contentRows, "fbGroupMessages"))} note="Community activity" />
          <StatCard title="New Members" value={number(sum(contentRows, "fbNewMembers"))} note="Community growth" />
          <StatCard title="Newsletter Posts" value={number(sum(contentRows, "newsletter"))} note="Published count" />
        </section>

        <article className="panel">
          <h4>Daily Content & Community</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Newsletters</th>
                  <th>YouTube</th>
                  <th>FB Reels</th>
                  <th>IG Reels</th>
                  <th>FB Posts</th>
                  <th>Messages</th>
                  <th>New Members</th>
                </tr>
              </thead>
              <tbody>
                {contentRows.slice().reverse().map((row) => (
                  <tr key={row.date}>
                    <td>{dateLabel(row.date)}</td>
                    <td>{row.newsletter}</td>
                    <td>{row.youtubeShorts}</td>
                    <td>{row.facebookReels}</td>
                    <td>{row.igReels}</td>
                    <td>{row.facebookPosts}</td>
                    <td>{row.fbGroupMessages}</td>
                    <td>{row.fbNewMembers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </>
    );
  }

  function renderExpenses(): ReactElement {
    const rows = expensesRows.map((row) => ({ ...row, total: row.marketingSpend + row.teamCosts + row.technology + row.other }));
    const total = sum(rows, "total");

    return (
      <>
        <section className="card-grid">
          <StatCard title="Weekly Expenses" value={money(rows[rows.length - 1]?.total || 0)} note="Latest week" />
          <StatCard title="Selected Range Total" value={money(total)} note="Expense total" />
          <StatCard title="Marketing Spend" value={money(sum(rows, "marketingSpend"))} note="Category total" />
          <StatCard title="Team Costs" value={money(sum(rows, "teamCosts"))} note="Category total" />
        </section>

        <article className="panel">
          <h4>Weekly Expense Table</h4>
          <div className="table-wrap" style={{ marginTop: 8 }}>
            <table>
              <thead>
                <tr>
                  <th>Week Ending</th>
                  <th>Marketing</th>
                  <th>Team</th>
                  <th>Technology</th>
                  <th>Other</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice().reverse().map((row) => (
                  <tr key={row.weekEnding}>
                    <td>{dateLabel(row.weekEnding)}</td>
                    <td>{money(row.marketingSpend)}</td>
                    <td>{money(row.teamCosts)}</td>
                    <td>{money(row.technology)}</td>
                    <td>{money(row.other)}</td>
                    <td><strong>{money(row.total)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </>
    );
  }

  function renderReferrals(): ReactElement {
    const totalRevenue = referrers.reduce((acc, row) => acc + row.revenue, 0);
    const totalPayout = referrers.reduce((acc, row) => acc + row.payout, 0);

    return (
      <>
        <section className="card-grid">
          <StatCard title="Referral Revenue" value={money(totalRevenue)} note="Program total" />
          <StatCard title="Total Payout" value={money(totalPayout)} note="Commissions" />
          <StatCard title="Net" value={money(totalRevenue - totalPayout)} note="Revenue - payout" />
          <StatCard title="Active Referrers" value={String(referrers.filter((row) => row.status === "Active").length)} note="Current month" />
        </section>

        <section className="split-2">
          <article className="panel">
            <h4>Referrer Leaderboard</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Referrals</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                    <th>Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {referrers.slice().sort((a, b) => b.revenue - a.revenue).map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td><span className={`chip ${row.status === "Active" ? "auto" : "warn"}`}>{row.status}</span></td>
                      <td>{row.referrals}</td>
                      <td>{row.conversions}</td>
                      <td>{money(row.revenue)}</td>
                      <td>{money(row.payout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h4>Referral Log</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Referrer</th>
                    <th>Lead</th>
                    <th>Offer</th>
                    <th>Status</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {referralLog.map((row) => (
                    <tr key={`${row.date}-${row.referred}`}>
                      <td>{dateLabel(row.date)}</td>
                      <td>{row.referrer}</td>
                      <td>{row.referred}</td>
                      <td>{row.offer}</td>
                      <td><span className={`chip ${row.status === "Converted" ? "auto" : row.status === "Pending" ? "warn" : "danger"}`}>{row.status}</span></td>
                      <td>{money(row.revenue)}</td>
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

  function renderConversions(): ReactElement {
    const rows = conversions.filter((row) => inRange(row.date, range));
    const totalRevenue = rows.reduce((acc, row) => acc + row.revenue, 0);
    const avgDays = rows.length ? rows.reduce((acc, row) => acc + row.daysToConvert, 0) / rows.length : 0;

    const sourceCount = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.source] = (acc[row.source] ?? 0) + 1;
      return acc;
    }, {});

    return (
      <>
        <section className="card-grid">
          <StatCard title="Total Conversions" value={String(rows.length)} note="Selected range" />
          <StatCard title="Total Revenue" value={money(totalRevenue)} note="Attributed" />
          <StatCard title="Avg Days to Convert" value={avgDays.toFixed(1)} note="Lead to close" />
          <StatCard title="Avg Deal Value" value={money(totalRevenue / Math.max(rows.length, 1))} note="Per conversion" />
        </section>

        <section className="split-2">
          <article className="panel">
            <h4>Source Mix</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Conversions</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(sourceCount).map(([source, count]) => (
                    <tr key={source}>
                      <td>{source}</td>
                      <td>{count}</td>
                      <td>{((count / Math.max(rows.length, 1)) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h4>Conversion Log</h4>
            <div className="table-wrap" style={{ marginTop: 8 }}>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Path</th>
                    <th>Days</th>
                    <th>Offer</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice().reverse().map((row) => (
                    <tr key={`${row.date}-${row.source}-${row.offer}`}>
                      <td>{dateLabel(row.date)}</td>
                      <td>{row.source}</td>
                      <td>{row.path}</td>
                      <td>{row.daysToConvert}</td>
                      <td>{row.offer}</td>
                      <td>{money(row.revenue)}</td>
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

  function renderSettings(): ReactElement {
    return (
      <article className="panel">
        <h4>API Connection Settings (Demo)</h4>
        <div className="table-wrap" style={{ marginTop: 8 }}>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Status</th>
                <th>Frequency</th>
                <th>Last Sync</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {connections.map((row, index) => (
                <tr key={row.provider}>
                  <td>{row.provider}</td>
                  <td>
                    <span className={`chip ${row.status === "Connected" ? "auto" : row.status === "Needs Auth" ? "warn" : "danger"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.frequency}</td>
                  <td>{row.last}</td>
                  <td>
                    <button
                      className="btn"
                      type="button"
                      onClick={() =>
                        setConnections((current) =>
                          current.map((entry, idx) =>
                            idx === index
                              ? {
                                  ...entry,
                                  status: Math.random() > 0.2 ? "Connected" : "Error",
                                  last: `${new Date().toLocaleString()} (test)`,
                                }
                              : entry
                          )
                        )
                      }
                    >
                      Test Connection
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    );
  }

  function renderCurrent(): ReactElement {
    if (view === "snapshot") return renderSnapshot();
    if (view === "revenue") return renderRevenue();
    if (view === "leads") return renderLeads();
    if (view === "meta") return renderMeta();
    if (view === "content") return renderContent();
    if (view === "expenses") return renderExpenses();
    if (view === "referrals") return renderReferrals();
    if (view === "conversions") return renderConversions();
    return renderSettings();
  }

  return (
    <>
      <ModuleHeader
        title="KPI Tracker"
        description="Polished, fully interactive KPI dashboard with sample data only."
        right={
          <>
            <select value={range} onChange={(event) => setRange(event.target.value as DateRangeKey)}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This Week</option>
              <option value="lastWeek">Last Week</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
            <button className="btn" type="button" onClick={exportView}>
              Export CSV
            </button>
          </>
        }
      />

      <section className="panel">
        <div className="control-row">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className="btn"
              type="button"
              onClick={() => setView(tab.key)}
              style={{
                borderColor: view === tab.key ? "var(--brand-orange)" : undefined,
                background: view === tab.key ? "color-mix(in srgb, var(--brand-gold) 20%, white)" : undefined,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {renderCurrent()}
    </>
  );
}
