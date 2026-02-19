"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  NOW,
  apiConnections,
  campaignData,
  contentData,
  conversionData,
  expensesData,
  leadData,
  metaData,
  referralLog,
  referrers,
  revenueData,
  weeklyTargets,
} from "@/lib/sample-data";
import type {
  ApiConnection,
  CampaignRow,
  ContentRow,
  ConversionRow,
  DateRangeKey,
  ExpenseRow,
  LeadRow,
  MetaRow,
  ReferralLogRow,
  ReferrerRow,
  RevenueRow,
  UserRole,
  ViewKey,
} from "@/lib/types";

type PaceState = {
  type: "ok" | "warn" | "danger";
  label: string;
  ratio: number;
};

type ChecklistItem = {
  text: string;
  done: boolean;
};

const views: Array<{ key: ViewKey; label: string; stage: "MVP" | "Phase 2" }> = [
  { key: "dashboard", label: "Dashboard", stage: "MVP" },
  { key: "revenue", label: "Revenue", stage: "MVP" },
  { key: "leads", label: "Leads", stage: "MVP" },
  { key: "meta", label: "Meta Ads", stage: "MVP" },
  { key: "content", label: "Content & Community", stage: "Phase 2" },
  { key: "expenses", label: "Expenses", stage: "Phase 2" },
  { key: "referrals", label: "Referrals & Affiliates", stage: "Phase 2" },
  { key: "conversions", label: "Conversions", stage: "MVP" },
  { key: "settings", label: "Settings", stage: "Phase 2" },
];

const subtitles: Record<ViewKey, string> = {
  dashboard: "At-a-glance KPI pulse with pace tracking and team focus.",
  revenue: "Daily and MTD revenue by source with run-rate projection.",
  leads: "Lead flow by channel and prospecting performance.",
  meta: "Campaign-level ad health and conditional KPI alerts.",
  content: "Content output plus community engagement trend visibility.",
  expenses: "Weekly expense controls with profitability snapshot.",
  referrals: "Referral lifecycle from lead to payout and leaderboard.",
  conversions: "Attribution, conversion velocity, and source quality.",
  settings: "API connection statuses and sync-control placeholders.",
};

function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatMoney(value: number, maxFractionDigits = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: maxFractionDigits,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string): string {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: Date): string {
  return value.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function csvEscape(value: string | number): string {
  const text = typeof value === "number" ? String(value) : value;
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function toCsv<T extends Record<string, string | number>>(rows: T[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(csvEscape).join(",");
  const body = rows
    .map((row) => headers.map((header) => csvEscape(row[header] ?? "")).join(","))
    .join("\n");
  return `${headerLine}\n${body}`;
}

function downloadCsv(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getRangeBounds(rangeKey: DateRangeKey): { start: Date; end: Date } {
  const now = new Date(NOW);
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (rangeKey === "today") {
    return { start, end };
  }

  if (rangeKey === "yesterday") {
    const dayStart = addDays(now, -1);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    return { start: dayStart, end: dayEnd };
  }

  if (rangeKey === "thisWeek" || rangeKey === "lastWeek") {
    const dayOfWeek = now.getDay();
    const mondayShift = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(now, mondayShift);
    monday.setHours(0, 0, 0, 0);
    const sunday = addDays(monday, 6);
    sunday.setHours(23, 59, 59, 999);

    if (rangeKey === "thisWeek") {
      return { start: monday, end: sunday };
    }

    const lastMonday = addDays(monday, -7);
    const lastSunday = addDays(sunday, -7);
    return { start: lastMonday, end: lastSunday };
  }

  if (rangeKey === "thisMonth" || rangeKey === "lastMonth") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    if (rangeKey === "thisMonth") {
      return { start: monthStart, end: monthEnd };
    }

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start: lastMonthStart, end: lastMonthEnd };
  }

  return { start, end };
}

function inRange(dateValue: string, rangeKey: DateRangeKey): boolean {
  const { start, end } = getRangeBounds(rangeKey);
  const date = new Date(`${dateValue}T12:00:00`);
  return date >= start && date <= end;
}

function paceStatus(actual: number, target: number): PaceState {
  const ratio = target === 0 ? 0 : actual / target;
  if (ratio >= 1) return { type: "ok", label: "On Pace", ratio };
  if (ratio >= 0.8) return { type: "warn", label: "Warning", ratio };
  return { type: "danger", label: "Off Pace", ratio };
}

function cplStatus(cpl: number): PaceState {
  if (cpl <= weeklyTargets.cplMax) return { type: "ok", label: "Healthy", ratio: 1 };
  if (cpl <= 20) return { type: "warn", label: "Warning", ratio: 0.7 };
  return { type: "danger", label: "Off Pace", ratio: 0.4 };
}

function sparkPoints(values: number[], width = 130, height = 34): string {
  if (values.length < 2) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  return values
    .map((value, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((value - min) / spread) * (height - 3) - 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function sum<T>(rows: T[], key: keyof T): number {
  return rows.reduce((acc, row) => {
    const value = row[key];
    return acc + (typeof value === "number" ? value : 0);
  }, 0);
}

function StatCard(props: {
  title: string;
  value: string;
  note: string;
  tone?: "up" | "down";
  spark?: number[];
}): ReactElement {
  return (
    <article className="panel metric-card">
      <p className="metric-title">{props.title}</p>
      <p className="metric-value">{props.value}</p>
      <p className={`metric-note ${props.tone ?? ""}`}>{props.note}</p>
      {props.spark && props.spark.length > 1 ? (
        <svg className="sparkline" viewBox="0 0 130 34" aria-hidden="true">
          <polyline points={sparkPoints(props.spark)} />
        </svg>
      ) : null}
    </article>
  );
}

function StatusPill({ status }: { status: PaceState }): ReactElement {
  return <span className={`status-pill ${status.type}`}>{status.label}</span>;
}

function rangeLabel(range: DateRangeKey): string {
  switch (range) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "thisWeek":
      return "This Week";
    case "lastWeek":
      return "Last Week";
    case "thisMonth":
      return "This Month";
    case "lastMonth":
      return "Last Month";
    default:
      return range;
  }
}

export default function Home(): ReactElement {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [range, setRange] = useState<DateRangeKey>("yesterday");
  const [role, setRole] = useState<UserRole>("admin");
  const [syncAt, setSyncAt] = useState<Date>(new Date("2026-02-19T04:30:00-07:00"));
  const [constraint, setConstraint] = useState<string>(
    "Improve ad creative hooks while keeping CPL under $15 this week."
  );
  const [newAction, setNewAction] = useState<string>("");
  const [actions, setActions] = useState<ChecklistItem[]>([
    { text: "Launch 2 new ad creatives by Wednesday", done: true },
    { text: "Publish 5 short-form videos by Friday", done: false },
    { text: "Follow up with warm leads in under 24h", done: true },
    { text: "Review campaign CPL daily at 3 PM", done: false },
    { text: "Log top 3 sales objections daily", done: false },
  ]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>(campaignData);
  const [connections, setConnections] = useState<ApiConnection[]>(apiConnections);

  useEffect(() => {
    const savedConstraint = window.localStorage.getItem("kpi-constraint");
    const savedRole = window.localStorage.getItem("kpi-role") as UserRole | null;
    const savedActions = window.localStorage.getItem("kpi-actions");

    if (savedConstraint) setConstraint(savedConstraint);
    if (savedRole === "admin" || savedRole === "editor" || savedRole === "viewer") setRole(savedRole);

    if (savedActions) {
      try {
        const parsed = JSON.parse(savedActions) as ChecklistItem[];
        if (Array.isArray(parsed)) setActions(parsed.slice(0, 5));
      } catch {
        // ignore malformed local storage payload
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("kpi-constraint", constraint);
  }, [constraint]);

  useEffect(() => {
    window.localStorage.setItem("kpi-actions", JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    window.localStorage.setItem("kpi-role", role);
  }, [role]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSyncAt(new Date());
    }, 300_000);

    return () => window.clearInterval(timer);
  }, []);

  const filteredRevenue = useMemo(
    () => revenueData.filter((row) => inRange(row.date, range)),
    [range]
  );
  const filteredLeads = useMemo(() => leadData.filter((row) => inRange(row.date, range)), [range]);
  const filteredMeta = useMemo(() => metaData.filter((row) => inRange(row.date, range)), [range]);
  const filteredContent = useMemo(
    () => contentData.filter((row) => inRange(row.date, range)),
    [range]
  );
  const filteredConversions = useMemo(
    () => conversionData.filter((row) => inRange(row.date, range)),
    [range]
  );
  const filteredExpenses = useMemo(() => {
    const bounds = getRangeBounds(range);
    return expensesData.filter((row) => {
      const date = new Date(`${row.weekEnding}T12:00:00`);
      return date >= bounds.start && date <= bounds.end;
    });
  }, [range]);

  const weekRevenueRows = useMemo(
    () => revenueData.filter((row) => inRange(row.date, "thisWeek")),
    []
  );
  const weekLeadRows = useMemo(() => leadData.filter((row) => inRange(row.date, "thisWeek")), []);
  const weekMetaRows = useMemo(() => metaData.filter((row) => inRange(row.date, "thisWeek")), []);

  const latestRevenue = filteredRevenue[filteredRevenue.length - 1];
  const latestLeads = filteredLeads[filteredLeads.length - 1];
  const latestMeta = filteredMeta[filteredMeta.length - 1];
  const latestContent = filteredContent[filteredContent.length - 1];

  const weekRevenueTotal = weekRevenueRows.reduce(
    (acc, row) => acc + row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other,
    0
  );
  const weekLeadTotal = weekLeadRows.reduce(
    (acc, row) =>
      acc + row.paidAds + row.organic + row.prospecting + row.facebookGroup + row.referrals + row.newsletter,
    0
  );
  const weekSpendTotal = sum(weekMetaRows, "spend");
  const weekCpl = +(weekSpendTotal / Math.max(weekLeadTotal, 1)).toFixed(2);

  const revenuePace = paceStatus(weekRevenueTotal, weeklyTargets.revenue);
  const leadPace = paceStatus(weekLeadTotal, weeklyTargets.leads);
  const cplPace = cplStatus(weekCpl);

  const dashboardAlerts = [
    revenuePace.type === "danger" ? "Revenue pace is below 80% of weekly target." : "",
    leadPace.type === "danger" ? "Lead pace is below 80% of weekly target." : "",
    cplPace.type === "danger" ? "CPL has breached $20 and needs immediate action." : "",
  ].filter(Boolean);

  const alertCount = dashboardAlerts.length + connections.filter((c) => c.status !== "Connected").length;

  const canEdit = role === "admin" || role === "editor";

  function toggleAction(index: number): void {
    setActions((current) =>
      current.map((item, idx) => (idx === index ? { ...item, done: !item.done } : item))
    );
  }

  function addAction(): void {
    if (!newAction.trim()) return;
    if (actions.length >= 5) return;
    setActions((current) => [...current, { text: newAction.trim(), done: false }]);
    setNewAction("");
  }

  function removeAction(index: number): void {
    setActions((current) => current.filter((_, idx) => idx !== index));
  }

  function updateCampaign(index: number, field: "status" | "notes", value: string): void {
    setCampaigns((current) =>
      current.map((campaign, idx) => {
        if (idx !== index) return campaign;
        if (field === "status") {
          const status = value as CampaignRow["status"];
          return { ...campaign, status };
        }
        return { ...campaign, notes: value };
      })
    );
  }

  function testConnection(index: number): void {
    const nowLabel = formatDateTime(new Date());
    setConnections((current) =>
      current.map((connection, idx) => {
        if (idx !== index) return connection;
        const random = Math.random();
        const status: ApiConnection["status"] = random > 0.2 ? "Connected" : "Error";
        return {
          ...connection,
          status,
          lastSync: `${nowLabel} (test)`,
        };
      })
    );
  }

  function exportCurrentView(): void {
    let filePrefix = `${view}-${range}`;
    let rows: Array<Record<string, string | number>> = [];

    if (view === "dashboard") {
      rows = [
        {
          date_range: rangeLabel(range),
          week_revenue: weekRevenueTotal,
          week_leads: weekLeadTotal,
          week_spend: weekSpendTotal,
          week_cpl: weekCpl,
          revenue_pace: revenuePace.label,
          lead_pace: leadPace.label,
          cpl_pace: cplPace.label,
          current_constraint: constraint,
        },
      ];
    }

    if (view === "revenue") {
      rows = filteredRevenue.map((row) => ({
        date: row.date,
        high_ticket_cash: row.highTicket,
        payment_plan_initial: row.paymentPlan,
        mrr_collected: row.mrr,
        affiliate_revenue: row.affiliate,
        other: row.other,
        total: row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other,
        comments: row.comments || "",
      }));
    }

    if (view === "leads") {
      rows = filteredLeads.map((row) => ({
        date: row.date,
        paid_ads: row.paidAds,
        organic_social: row.organic,
        prospecting: row.prospecting,
        facebook_group: row.facebookGroup,
        referrals: row.referrals,
        newsletter: row.newsletter,
        total:
          row.paidAds +
          row.organic +
          row.prospecting +
          row.facebookGroup +
          row.referrals +
          row.newsletter,
        comments: row.comments || "",
      }));
    }

    if (view === "meta") {
      rows = filteredMeta.map((row) => ({
        date: row.date,
        spend: row.spend,
        impressions: row.impressions,
        clicks: row.clicks,
        ctr: row.ctr,
        leads: row.leads,
        cpl: row.cpl,
        registrations: row.registrations,
      }));
    }

    if (view === "content") {
      rows = filteredContent.map((row) => ({
        date: row.date,
        newsletter: row.newsletter,
        youtube_shorts: row.youtubeShorts,
        facebook_reels: row.facebookReels,
        ig_reels: row.igReels,
        facebook_posts: row.facebookPosts,
        fb_group_messages: row.fbGroupMessages,
        fb_new_members: row.fbNewMembers,
      }));
    }

    if (view === "expenses") {
      rows = filteredExpenses.map((row) => ({
        week_ending: row.weekEnding,
        marketing_spend: row.marketingSpend,
        team_costs: row.teamCosts,
        technology: row.technology,
        other: row.other,
        total: row.marketingSpend + row.teamCosts + row.technology + row.other,
      }));
    }

    if (view === "referrals") {
      rows = referralLog.map((row) => ({
        date: row.date,
        referrer: row.referrer,
        referred: row.referred,
        offer: row.offer,
        status: row.status,
        revenue: row.revenue,
        commission: row.commission,
      }));
    }

    if (view === "conversions") {
      rows = filteredConversions.map((row) => ({
        date: row.date,
        source: row.source,
        conversion_path: row.path,
        days_to_convert: row.daysToConvert,
        revenue: row.revenue,
        offer: row.offer,
      }));
    }

    if (view === "settings") {
      rows = connections.map((row) => ({
        provider: row.name,
        status: row.status,
        sync_frequency: row.frequency,
        last_sync: row.lastSync,
      }));
    }

    const csv = toCsv(rows);
    if (!csv) return;
    downloadCsv(`${filePrefix}.csv`, csv);
  }

  function renderDashboard(): ReactElement {
    const todayRevenue = latestRevenue
      ? latestRevenue.highTicket +
        latestRevenue.paymentPlan +
        latestRevenue.mrr +
        latestRevenue.affiliate +
        latestRevenue.other
      : 0;

    const todayLeads = latestLeads
      ? latestLeads.paidAds +
        latestLeads.organic +
        latestLeads.prospecting +
        latestLeads.facebookGroup +
        latestLeads.referrals +
        latestLeads.newsletter
      : 0;

    const todaySpend = latestMeta?.spend ?? 0;
    const todayCpl = +(todaySpend / Math.max(todayLeads, 1)).toFixed(2);
    const todayContent = latestContent
      ? latestContent.newsletter +
        latestContent.youtubeShorts +
        latestContent.facebookReels +
        latestContent.igReels +
        latestContent.facebookPosts
      : 0;

    return (
      <>
        <section className="card-grid">
          <StatCard
            title="Revenue Collected"
            value={formatMoney(todayRevenue)}
            note="Yesterday total"
            spark={weekRevenueRows.map(
              (row) => row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other
            )}
          />
          <StatCard
            title="Leads Generated"
            value={formatNumber(todayLeads)}
            note="Yesterday total"
            spark={weekLeadRows.map(
              (row) =>
                row.paidAds +
                row.organic +
                row.prospecting +
                row.facebookGroup +
                row.referrals +
                row.newsletter
            )}
          />
          <StatCard
            title="Ad Spend"
            value={formatMoney(todaySpend)}
            note="Yesterday total"
            spark={weekMetaRows.map((row) => row.spend)}
          />
          <StatCard
            title="Cost Per Lead"
            value={`$${todayCpl.toFixed(2)}`}
            note="Spend / leads"
            tone={todayCpl > weeklyTargets.cplMax ? "down" : "up"}
            spark={weekMetaRows.map((row) => row.cpl)}
          />
          <StatCard
            title="Content Pieces"
            value={formatNumber(todayContent)}
            note="Across tracked channels"
            spark={filteredContent
              .slice(-7)
              .map(
                (row) =>
                  row.newsletter +
                  row.youtubeShorts +
                  row.facebookReels +
                  row.igReels +
                  row.facebookPosts
              )}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Weekly Pace Indicators</h3>
            <div className="progress-stack">
              {[
                {
                  label: "Revenue pace to $25k/wk",
                  status: revenuePace,
                  value: `${formatMoney(weekRevenueTotal)} / ${formatMoney(weeklyTargets.revenue)}`,
                  width: Math.min(revenuePace.ratio * 100, 130),
                },
                {
                  label: "Lead pace to 100/wk",
                  status: leadPace,
                  value: `${formatNumber(weekLeadTotal)} / ${formatNumber(weeklyTargets.leads)}`,
                  width: Math.min(leadPace.ratio * 100, 130),
                },
                {
                  label: "CPL health vs $10-$15 target",
                  status: cplPace,
                  value: `$${weekCpl.toFixed(2)} / $${weeklyTargets.cplMax}`,
                  width: Math.min((weeklyTargets.cplMax / Math.max(weekCpl, 1)) * 100, 100),
                },
              ].map((item) => (
                <div className="progress-line" key={item.label}>
                  <div className="progress-label">
                    <span>{item.label}</span>
                    <span>
                      <StatusPill status={item.status} /> {item.value}
                    </span>
                  </div>
                  <div className="track">
                    <div className={`fill ${item.status.type}`} style={{ width: `${item.width}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel inline-stack">
            <h3 className="panel-title">Weekly Constraint + Actions</h3>
            <div className="field">
              <label htmlFor="constraint">Current #1 Constraint</label>
              <textarea
                id="constraint"
                value={constraint}
                disabled={!canEdit}
                onChange={(event) => setConstraint(event.target.value)}
                rows={4}
              />
            </div>
            <div className="field">
              <label htmlFor="new-action">Action Item (max 5)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="new-action"
                  value={newAction}
                  disabled={!canEdit || actions.length >= 5}
                  onChange={(event) => setNewAction(event.target.value)}
                  placeholder="Add weekly action"
                />
                <button className="btn" type="button" disabled={!canEdit || actions.length >= 5} onClick={addAction}>
                  Add
                </button>
              </div>
            </div>
            <div className="inline-stack">
              {actions.map((item, index) => (
                <div className="check-row" key={`${item.text}-${index}`}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    disabled={!canEdit}
                    onChange={() => toggleAction(index)}
                  />
                  <span>{item.text}</span>
                  {canEdit ? (
                    <button className="btn" type="button" onClick={() => removeAction(index)}>
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderRevenue(rows: RevenueRow[]): ReactElement {
    const enriched = rows.map((row) => ({
      ...row,
      total: row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other,
    }));

    const total = sum(enriched, "total");
    const avg = enriched.length ? total / enriched.length : 0;
    const now = NOW;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysElapsed = Math.min(now.getDate(), daysInMonth);
    const projected = avg * daysInMonth;

    const sidebarItems = [
      { label: "Month-to-date total", value: formatMoney(total) },
      { label: "Daily average", value: formatMoney(avg) },
      { label: "Days remaining", value: String(daysInMonth - daysElapsed) },
      { label: "Projected month-end", value: formatMoney(projected) },
    ];

    const sourceMix = [
      { label: "High Ticket", value: sum(enriched, "highTicket") },
      { label: "Payment Plan", value: sum(enriched, "paymentPlan") },
      { label: "MRR", value: sum(enriched, "mrr") },
      { label: "Affiliate", value: sum(enriched, "affiliate") },
      { label: "Other", value: sum(enriched, "other") },
    ];

    return (
      <>
        <section className="card-grid">
          <StatCard title="MTD Total" value={formatMoney(total)} note="Selected range" spark={enriched.map((r) => r.total)} />
          <StatCard title="Daily Average" value={formatMoney(avg)} note="Revenue per day" spark={enriched.map((r) => r.total)} />
          <StatCard
            title="Projected Month-End"
            value={formatMoney(projected)}
            note="Average x total month days"
            spark={enriched.map((r) => r.total)}
          />
          <StatCard
            title="Affiliate Share"
            value={`${((sum(enriched, "affiliate") / Math.max(total, 1)) * 100).toFixed(1)}%`}
            note="Contribution to total revenue"
            spark={enriched.map((r) => r.affiliate)}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Daily Revenue Table</h3>
            <div className="table-wrap">
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
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched
                    .slice()
                    .reverse()
                    .map((row) => (
                      <tr key={row.date}>
                        <td>{formatDate(row.date)}</td>
                        <td>{formatMoney(row.highTicket)}</td>
                        <td>{formatMoney(row.paymentPlan)}</td>
                        <td>{formatMoney(row.mrr)}</td>
                        <td>{formatMoney(row.affiliate)}</td>
                        <td>{formatMoney(row.other)}</td>
                        <td>
                          <strong>{formatMoney(row.total)}</strong>
                        </td>
                        <td>
                          {row.comments ? <span className="chip hybrid">Manual + API</span> : <span className="chip auto">API</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel inline-stack">
            <h3 className="panel-title">Running Totals</h3>
            <div className="kpi-list">
              {sidebarItems.map((item) => (
                <div className="kpi-line" key={item.label}>
                  <p className="kpi-label">{item.label}</p>
                  <p className="kpi-value">{item.value}</p>
                </div>
              ))}
            </div>

            <h3 className="panel-title">Revenue Source Mix</h3>
            <div className="bar-stack">
              {sourceMix.map((source) => {
                const pct = (source.value / Math.max(total, 1)) * 100;
                return (
                  <div className="bar-row" key={source.label}>
                    <p className="bar-title">{source.label}</p>
                    <div className="hbar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p className="bar-foot">
                      {pct.toFixed(1)}% ({formatMoney(source.value)})
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderLeads(rows: LeadRow[]): ReactElement {
    const enriched = rows.map((row) => ({
      ...row,
      total:
        row.paidAds +
        row.organic +
        row.prospecting +
        row.facebookGroup +
        row.referrals +
        row.newsletter,
    }));

    const totals = {
      paidAds: sum(enriched, "paidAds"),
      organic: sum(enriched, "organic"),
      prospecting: sum(enriched, "prospecting"),
      facebookGroup: sum(enriched, "facebookGroup"),
      referrals: sum(enriched, "referrals"),
      newsletter: sum(enriched, "newsletter"),
      total: sum(enriched, "total"),
    };

    const dmsSent = Math.round(totals.prospecting * 2.5);
    const responses = Math.round(dmsSent * 0.37);
    const qualified = Math.round(responses * 0.42);
    const attributed = qualified * 697;

    return (
      <>
        <section className="card-grid">
          <StatCard title="Total Leads" value={formatNumber(totals.total)} note="Selected range" spark={enriched.map((r) => r.total)} />
          <StatCard
            title="Paid Ads Share"
            value={`${((totals.paidAds / Math.max(totals.total, 1)) * 100).toFixed(1)}%`}
            note="Primary lead source"
            spark={enriched.map((r) => r.paidAds)}
          />
          <StatCard
            title="7-Day Running Total"
            value={formatNumber(enriched.slice(-7).reduce((acc, row) => acc + row.total, 0))}
            note="Last 7 days"
            spark={enriched.map((r) => r.total)}
          />
          <StatCard
            title="Lead Volatility"
            value={`${Math.max(...enriched.map((r) => r.total), 0) - Math.min(...enriched.map((r) => r.total), 0)}`}
            note="Spread across selected period"
            spark={enriched.map((r) => r.total)}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Lead Source Mix</h3>
            <div className="bar-stack">
              {[
                ["Paid Ads", totals.paidAds],
                ["Organic Social", totals.organic],
                ["Prospecting", totals.prospecting],
                ["Facebook Group", totals.facebookGroup],
                ["Referrals", totals.referrals],
                ["Newsletter", totals.newsletter],
              ].map(([label, value]) => {
                const pct = (Number(value) / Math.max(totals.total, 1)) * 100;
                return (
                  <div className="bar-row" key={String(label)}>
                    <p className="bar-title">{label}</p>
                    <div className="hbar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p className="bar-foot">
                      {formatNumber(Number(value))} ({pct.toFixed(1)}%)
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Prospecting Tracker</h3>
            <div className="kpi-list">
              <div className="kpi-line">
                <p className="kpi-label">DMs Sent</p>
                <p className="kpi-value">{formatNumber(dmsSent)}</p>
              </div>
              <div className="kpi-line">
                <p className="kpi-label">Responses</p>
                <p className="kpi-value">{formatNumber(responses)}</p>
              </div>
              <div className="kpi-line">
                <p className="kpi-label">Qualified Leads</p>
                <p className="kpi-value">{formatNumber(qualified)}</p>
              </div>
              <div className="kpi-line">
                <p className="kpi-label">Revenue Attributed</p>
                <p className="kpi-value">{formatMoney(attributed)}</p>
              </div>
            </div>
          </article>
        </section>

        <section className="panel">
          <h3 className="panel-title">Daily Lead Table</h3>
          <div className="table-wrap">
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
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {enriched
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr key={row.date}>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.paidAds}</td>
                      <td>{row.organic}</td>
                      <td>{row.prospecting}</td>
                      <td>{row.facebookGroup}</td>
                      <td>{row.referrals}</td>
                      <td>{row.newsletter}</td>
                      <td>
                        <strong>{row.total}</strong>
                      </td>
                      <td>{row.comments || <span className="muted">-</span>}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderMeta(rows: MetaRow[]): ReactElement {
    const rolling = rows.slice(-7);
    const avgSpend = sum(rolling, "spend") / Math.max(rolling.length, 1);
    const avgCpl = sum(rolling, "cpl") / Math.max(rolling.length, 1);
    const avgCtr = sum(rolling, "ctr") / Math.max(rolling.length, 1);
    const avgRegs = sum(rolling, "registrations") / Math.max(rolling.length, 1);

    return (
      <>
        <section className="card-grid">
          <StatCard title="Avg Daily Spend (7d)" value={formatMoney(avgSpend)} note="Rolling average" spark={rows.map((r) => r.spend)} />
          <StatCard
            title="Avg CPL (7d)"
            value={`$${avgCpl.toFixed(2)}`}
            note="Target $10-$15"
            tone={avgCpl > weeklyTargets.cplMax ? "down" : "up"}
            spark={rows.map((r) => r.cpl)}
          />
          <StatCard
            title="Avg CTR (7d)"
            value={`${avgCtr.toFixed(2)}%`}
            note="Red flag below 1%"
            tone={avgCtr < 1 ? "down" : "up"}
            spark={rows.map((r) => r.ctr)}
          />
          <StatCard
            title="Registrations / Day"
            value={avgRegs.toFixed(1)}
            note="Rolling average"
            spark={rows.map((r) => r.registrations)}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Daily Performance Table</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Spend</th>
                    <th>Impressions</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                    <th>Leads</th>
                    <th>CPL</th>
                    <th>Registrations</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .slice()
                    .reverse()
                    .map((row) => (
                      <tr key={row.date}>
                        <td>{formatDate(row.date)}</td>
                        <td>{formatMoney(row.spend)}</td>
                        <td>{formatNumber(row.impressions)}</td>
                        <td>{formatNumber(row.clicks)}</td>
                        <td className={row.ctr < 1 ? "neg" : ""}>{row.ctr.toFixed(2)}%</td>
                        <td>{formatNumber(row.leads)}</td>
                        <td className={row.cpl > 20 ? "neg" : row.cpl <= weeklyTargets.cplMax ? "pos" : ""}>
                          ${row.cpl.toFixed(2)}
                        </td>
                        <td>{row.registrations}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Campaign Management</h3>
            <div className="table-wrap">
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
                  {campaigns.map((campaign, index) => (
                    <tr key={campaign.name} className={campaign.highCplStreak >= 2 ? "row-alert" : ""}>
                      <td>{campaign.name}</td>
                      <td>
                        <select
                          disabled={!canEdit}
                          value={campaign.status}
                          onChange={(event) => updateCampaign(index, "status", event.target.value)}
                        >
                          <option>Active</option>
                          <option>Paused</option>
                          <option>Off</option>
                        </select>
                      </td>
                      <td>{formatMoney(campaign.dailySpend)}</td>
                      <td>{campaign.leads}</td>
                      <td className={campaign.cpl > 20 ? "neg" : ""}>${campaign.cpl.toFixed(2)}</td>
                      <td>
                        <input
                          value={campaign.notes}
                          disabled={!canEdit}
                          onChange={(event) => updateCampaign(index, "notes", event.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section className="panel">
          <h3 className="panel-title">CPL Trend vs Target Band</h3>
          <div className="bar-stack">
            {rows.slice(-12).map((row) => (
              <div className="bar-row" key={row.date}>
                <p className="bar-title">
                  {formatDate(row.date)} - ${row.cpl.toFixed(2)} CPL
                </p>
                <div className="hbar">
                  <span style={{ width: `${Math.min((row.cpl / 25) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderContent(rows: ContentRow[]): ReactElement {
    const totals = rows.reduce(
      (acc, row) => {
        acc.content +=
          row.newsletter + row.youtubeShorts + row.facebookReels + row.igReels + row.facebookPosts;
        acc.messages += row.fbGroupMessages;
        acc.members += row.fbNewMembers;
        return acc;
      },
      { content: 0, messages: 0, members: 0 }
    );
    const weekRows = rows.slice(-7);

    return (
      <>
        <section className="card-grid">
          <StatCard
            title="Content Pieces"
            value={formatNumber(totals.content)}
            note="Selected range"
            spark={rows.map(
              (row) =>
                row.newsletter +
                row.youtubeShorts +
                row.facebookReels +
                row.igReels +
                row.facebookPosts
            )}
          />
          <StatCard title="FB Group Messages" value={formatNumber(totals.messages)} note="Community conversations" spark={rows.map((row) => row.fbGroupMessages)} />
          <StatCard title="New Members" value={formatNumber(totals.members)} note="Community growth" spark={rows.map((row) => row.fbNewMembers)} />
          <StatCard
            title="Weekly Output"
            value={formatNumber(
              weekRows.reduce(
                (acc, row) =>
                  acc + row.newsletter + row.youtubeShorts + row.facebookReels + row.igReels + row.facebookPosts,
                0
              )
            )}
            note="Last 7 days"
            spark={weekRows.map(
              (row) =>
                row.newsletter +
                row.youtubeShorts +
                row.facebookReels +
                row.igReels +
                row.facebookPosts
            )}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Daily Content Table</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Newsletter</th>
                    <th>YouTube Shorts</th>
                    <th>FB Reels</th>
                    <th>IG Reels</th>
                    <th>FB Posts</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {rows
                    .slice()
                    .reverse()
                    .map((row) => {
                      const total =
                        row.newsletter +
                        row.youtubeShorts +
                        row.facebookReels +
                        row.igReels +
                        row.facebookPosts;
                      return (
                        <tr key={row.date}>
                          <td>{formatDate(row.date)}</td>
                          <td>{row.newsletter}</td>
                          <td>{row.youtubeShorts}</td>
                          <td>{row.facebookReels}</td>
                          <td>{row.igReels}</td>
                          <td>{row.facebookPosts}</td>
                          <td>
                            <strong>{total}</strong>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Community Engagement</h3>
            <div className="kpi-list">
              {weekRows.map((row) => (
                <div className="kpi-line" key={row.date}>
                  <p className="kpi-label">{formatDate(row.date)}</p>
                  <p className="kpi-value">
                    {row.fbGroupMessages} messages, {row.fbNewMembers} new members
                  </p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderExpenses(rows: ExpenseRow[]): ReactElement {
    const enriched = rows.map((row) => ({
      ...row,
      total: row.marketingSpend + row.teamCosts + row.technology + row.other,
    }));
    const thisWeek = enriched[enriched.length - 1];
    const totalExpense = sum(enriched, "total");
    const matchedRevenue = filteredRevenue.reduce(
      (acc, row) => acc + row.highTicket + row.paymentPlan + row.mrr + row.affiliate + row.other,
      0
    );
    const margin = ((matchedRevenue - totalExpense) / Math.max(matchedRevenue, 1)) * 100;

    return (
      <>
        <section className="card-grid">
          <StatCard
            title="This Week Expenses"
            value={formatMoney(thisWeek?.total ?? 0)}
            note="Latest week ending"
            spark={enriched.map((row) => row.total)}
          />
          <StatCard title="Selected Range Expenses" value={formatMoney(totalExpense)} note="Expense total" spark={enriched.map((row) => row.total)} />
          <StatCard
            title="Revenue vs Expense"
            value={formatMoney(matchedRevenue - totalExpense)}
            note="Net contribution"
            tone={matchedRevenue >= totalExpense ? "up" : "down"}
            spark={enriched.map((row) => row.total)}
          />
          <StatCard
            title="Gross Margin"
            value={`${margin.toFixed(1)}%`}
            note="Revenue minus expenses"
            tone={margin >= 35 ? "up" : "down"}
            spark={enriched.map((row) => row.total)}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Weekly Expense Table</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Week Ending</th>
                    <th>Marketing</th>
                    <th>Team Costs</th>
                    <th>Technology</th>
                    <th>Other</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {enriched
                    .slice()
                    .reverse()
                    .map((row) => (
                      <tr key={row.weekEnding}>
                        <td>{formatDate(row.weekEnding)}</td>
                        <td>{formatMoney(row.marketingSpend)}</td>
                        <td>{formatMoney(row.teamCosts)}</td>
                        <td>{formatMoney(row.technology)}</td>
                        <td>{formatMoney(row.other)}</td>
                        <td>
                          <strong>{formatMoney(row.total)}</strong>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Expense Mix</h3>
            <div className="bar-stack">
              {[
                ["Marketing", sum(enriched, "marketingSpend")],
                ["Team Costs", sum(enriched, "teamCosts")],
                ["Technology", sum(enriched, "technology")],
                ["Other", sum(enriched, "other")],
              ].map(([label, value]) => {
                const pct = (Number(value) / Math.max(totalExpense, 1)) * 100;
                return (
                  <div className="bar-row" key={String(label)}>
                    <p className="bar-title">{label}</p>
                    <div className="hbar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p className="bar-foot">
                      {pct.toFixed(1)}% ({formatMoney(Number(value))})
                    </p>
                  </div>
                );
              })}
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderReferrals(logRows: ReferralLogRow[], directory: ReferrerRow[]): ReactElement {
    const totalRevenue = directory.reduce((acc, row) => acc + row.revenue, 0);
    const totalPayout = directory.reduce((acc, row) => acc + row.commission, 0);
    const totalReferrals = directory.reduce((acc, row) => acc + row.referrals, 0);
    const totalConversions = directory.reduce((acc, row) => acc + row.conversions, 0);
    const conversionRate = (totalConversions / Math.max(totalReferrals, 1)) * 100;

    return (
      <>
        <section className="card-grid">
          <StatCard title="Referral Revenue" value={formatMoney(totalRevenue)} note="Program-attributed" spark={directory.map((row) => row.revenue)} />
          <StatCard title="Commission Payouts" value={formatMoney(totalPayout)} note="Outstanding + paid" spark={directory.map((row) => row.commission)} />
          <StatCard
            title="Conversion Rate"
            value={`${conversionRate.toFixed(1)}%`}
            note="Referrals to conversions"
            spark={directory.map((row) => row.conversions)}
          />
          <StatCard
            title="Program ROI"
            value={`${(((totalRevenue - totalPayout) / Math.max(totalPayout, 1)) * 100).toFixed(0)}%`}
            note="(Revenue - payout) / payout"
            spark={directory.map((row) => row.revenue - row.commission)}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Referrer Directory + Leaderboard</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Referrer</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Rate</th>
                    <th>Referrals</th>
                    <th>Conversions</th>
                    <th>Revenue</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {directory
                    .slice()
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((row) => (
                      <tr key={row.name}>
                        <td>{row.name}</td>
                        <td>{row.email}</td>
                        <td>
                          <span className={`chip ${row.status === "Active" ? "auto" : "manual"}`}>{row.status}</span>
                        </td>
                        <td>{row.commissionRate}%</td>
                        <td>{row.referrals}</td>
                        <td>{row.conversions}</td>
                        <td>{formatMoney(row.revenue)}</td>
                        <td>{formatMoney(row.commission)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Referral Log</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Referrer</th>
                    <th>Referred Person</th>
                    <th>Offer</th>
                    <th>Status</th>
                    <th>Revenue</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  {logRows.map((row) => (
                    <tr key={`${row.date}-${row.referred}`}>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.referrer}</td>
                      <td>{row.referred}</td>
                      <td>{row.offer}</td>
                      <td>
                        <span
                          className={`chip ${
                            row.status === "Converted" ? "auto" : row.status === "Pending" ? "hybrid" : "alert"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td>{formatMoney(row.revenue)}</td>
                      <td>{formatMoney(row.commission)}</td>
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

  function renderConversions(rows: ConversionRow[]): ReactElement {
    const totalRevenue = sum(rows, "revenue");
    const avgDays = rows.length ? rows.reduce((acc, row) => acc + row.daysToConvert, 0) / rows.length : 0;
    const avgDeal = rows.length ? totalRevenue / rows.length : 0;
    const sourceCounts = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.source] = (acc[row.source] ?? 0) + 1;
      return acc;
    }, {});
    const topSource = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0];

    const leadsCount = filteredLeads.reduce(
      (acc, row) =>
        acc + row.paidAds + row.organic + row.prospecting + row.facebookGroup + row.referrals + row.newsletter,
      0
    );
    const qualifiedCount = Math.round(leadsCount * 0.44);
    const closedCount = rows.length;

    return (
      <>
        <section className="card-grid">
          <StatCard title="Total Conversions" value={formatNumber(rows.length)} note="Selected range" spark={rows.map((row) => row.revenue)} />
          <StatCard
            title="Avg Days To Convert"
            value={`${avgDays.toFixed(1)} days`}
            note="Lead created to close"
            spark={rows.map((row) => row.daysToConvert)}
          />
          <StatCard
            title="Top Source"
            value={topSource?.[0] ?? "N/A"}
            note={`${topSource?.[1] ?? 0} conversions`}
            spark={Object.values(sourceCounts)}
          />
          <StatCard
            title="Avg Deal Value"
            value={formatMoney(avgDeal)}
            note="Revenue per conversion"
            spark={rows.map((row) => row.revenue)}
          />
        </section>

        <section className="split-2">
          <article className="panel">
            <h3 className="panel-title">Conversion by Source</h3>
            <div className="bar-stack">
              {Object.entries(sourceCounts).map(([source, count]) => {
                const pct = (count / Math.max(rows.length, 1)) * 100;
                return (
                  <div className="bar-row" key={source}>
                    <p className="bar-title">{source}</p>
                    <div className="hbar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p className="bar-foot">
                      {count} ({pct.toFixed(1)}%)
                    </p>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="panel">
            <h3 className="panel-title">Conversion Funnel</h3>
            <div className="bar-stack">
              {[
                ["Leads", leadsCount],
                ["Qualified", qualifiedCount],
                ["Closed", closedCount],
              ].map(([label, count]) => {
                const pct = (Number(count) / Math.max(leadsCount, 1)) * 100;
                return (
                  <div className="bar-row" key={String(label)}>
                    <p className="bar-title">{label}</p>
                    <div className="hbar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <p className="bar-foot">{formatNumber(Number(count))}</p>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section className="panel">
          <h3 className="panel-title">Conversion Log</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Lead Source</th>
                  <th>Conversion Path</th>
                  <th>Days To Convert</th>
                  <th>Revenue</th>
                  <th>Offer Type</th>
                </tr>
              </thead>
              <tbody>
                {rows
                  .slice()
                  .reverse()
                  .map((row) => (
                    <tr key={`${row.date}-${row.source}-${row.offer}`}>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.source}</td>
                      <td>{row.path}</td>
                      <td>{row.daysToConvert}</td>
                      <td>{formatMoney(row.revenue)}</td>
                      <td>{row.offer}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  }

  function renderSettings(rows: ApiConnection[]): ReactElement {
    return (
      <>
        <section className="card-grid">
          <StatCard
            title="Connected APIs"
            value={String(rows.filter((row) => row.status === "Connected").length)}
            note={`${rows.length} configured providers`}
          />
          <StatCard
            title="Needs Attention"
            value={String(rows.filter((row) => row.status !== "Connected").length)}
            note="Auth or sync issues"
            tone={rows.some((row) => row.status !== "Connected") ? "down" : "up"}
          />
          <StatCard
            title="Auto Refresh"
            value="Every 5 min"
            note="When tab is active"
          />
          <StatCard
            title="Role Mode"
            value={role.toUpperCase()}
            note="Editing permissions applied"
          />
        </section>

        <section className="panel">
          <h3 className="panel-title">API Connection Settings</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Sync Frequency</th>
                  <th>Last Sync</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>
                      <span
                        className={`chip ${
                          row.status === "Connected"
                            ? "auto"
                            : row.status === "Needs Auth"
                              ? "manual"
                              : "alert"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td>{row.frequency}</td>
                    <td>{row.lastSync}</td>
                    <td>
                      <button className="btn" type="button" onClick={() => testConnection(index)}>
                        Test Connection
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted">
            OAuth connection flows and scheduled sync jobs are intentionally stubbed for the demo stage.
          </p>
        </section>
      </>
    );
  }

  function renderCurrentView(): ReactElement {
    if (view === "dashboard") return renderDashboard();
    if (view === "revenue") return renderRevenue(filteredRevenue);
    if (view === "leads") return renderLeads(filteredLeads);
    if (view === "meta") return renderMeta(filteredMeta);
    if (view === "content") return renderContent(filteredContent);
    if (view === "expenses") return renderExpenses(filteredExpenses);
    if (view === "referrals") return renderReferrals(referralLog, referrers);
    if (view === "conversions") return renderConversions(filteredConversions);
    return renderSettings(connections);
  }

  return (
    <div className="portal-shell">
      <aside className="portal-sidebar">
        <div className="brand-wrap">
          <p className="brand-kicker">The Real Estate Reset</p>
          <p className="brand-title">KPI Dashboard</p>
          <p className="brand-note">Demo app (sample data) - Feb 19, 2026</p>
        </div>

        <nav className="nav-grid" aria-label="Module navigation">
          {views.map((entry) => (
            <button
              key={entry.key}
              type="button"
              className={`nav-btn ${entry.key === view ? "active" : ""}`}
              onClick={() => setView(entry.key)}
            >
              <span className="nav-label">
                <span>{entry.label}</span>
                <span className="nav-chip">{entry.stage}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-meta">
          <p>Active role controls edit access:</p>
          <div className="badge-row">
            <span className="pill">Admin</span>
            <span className="pill">Editor</span>
            <span className="pill">Viewer</span>
          </div>
        </div>
      </aside>

      <main className="portal-main">
        <header className="portal-topbar">
          <div>
            <h1 className="portal-title">{views.find((item) => item.key === view)?.label}</h1>
            <p className="portal-subtitle">{subtitles[view]}</p>
          </div>

          <div className="top-controls">
            <div className="field">
              <label htmlFor="role">Role</label>
              <select id="role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="range">Date Range</label>
              <select id="range" value={range} onChange={(event) => setRange(event.target.value as DateRangeKey)}>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="thisWeek">This Week</option>
                <option value="lastWeek">Last Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
              </select>
            </div>

            <div className="sync-pill">
              <span className="dot" />
              <span>Data as of {formatDateTime(syncAt)} MST</span>
            </div>

            <button className="btn" type="button" onClick={() => setSyncAt(new Date())}>
              Refresh
            </button>

            <button className="btn brand" type="button" onClick={exportCurrentView}>
              Export CSV
            </button>

            <span className="pill">Alerts: {alertCount}</span>
          </div>
        </header>

        {view === "dashboard" && dashboardAlerts.length > 0 ? (
          <div className="alert">Alert: {dashboardAlerts.join(" ")}</div>
        ) : null}

        <section className="view-stack">{renderCurrentView()}</section>
      </main>
    </div>
  );
}
