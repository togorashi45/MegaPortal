import type { ContentRow, DateRangeKey, ExpenseRow, LeadRow, MetaRow, RevenueRow } from "@/types/kpi";

export const NOW = new Date("2026-02-19T11:30:00-07:00");

function wave(seed: number, amplitude: number, shift = 0): number {
  return Math.sin(seed * 0.62 + shift) * amplitude;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const dayKeys = Array.from({ length: 50 }, (_, index) => iso(addDays(NOW, index - 49)));

export const revenueData: RevenueRow[] = dayKeys.map((date, idx) => {
  const highTicket = Math.max(1100, Math.round(4900 + wave(idx, 1500, 0.4)));
  const paymentPlan = Math.max(350, Math.round(1160 + wave(idx, 450, 0.2)));
  const mrr = Math.max(320, Math.round(820 + wave(idx, 290, 1.1)));
  const affiliate = Math.max(0, Math.round(340 + wave(idx, 220, 0.7)));
  const other = idx % 9 === 0 ? 240 : 0;
  return {
    date,
    highTicket,
    paymentPlan,
    mrr,
    affiliate,
    other,
    comments: idx % 6 === 0 ? "Manual adjustment from delayed ACH" : "",
  };
});

export const leadData: LeadRow[] = dayKeys.map((date, idx) => {
  const paidAds = Math.max(8, Math.round(29 + wave(idx, 10.5, 0.7)));
  const organic = Math.max(2, Math.round(9 + wave(idx, 4.2, 0.3)));
  const prospecting = Math.max(1, Math.round(6 + wave(idx, 3.1, 0.8)));
  const facebookGroup = Math.max(0, Math.round(4 + wave(idx, 2.3, 1.5)));
  const referrals = Math.max(1, Math.round(5 + wave(idx, 2.2, 1.9)));
  const newsletter = Math.max(0, Math.round(3 + wave(idx, 1.6, 1.7)));
  return {
    date,
    paidAds,
    organic,
    prospecting,
    facebookGroup,
    referrals,
    newsletter,
    comments: idx % 8 === 0 ? "Weekend data entered Monday" : "",
  };
});

export const metaData: MetaRow[] = dayKeys.map((date, idx) => {
  const spend = Math.max(260, Math.round(520 + wave(idx, 180, 0.3)));
  const impressions = Math.max(12000, Math.round(17200 + wave(idx, 5400, 0.6)));
  const ctr = Math.max(0.5, +(1.2 + wave(idx, 0.56, 0.5)).toFixed(2));
  const clicks = Math.round((impressions * ctr) / 100);
  const leads = Math.max(10, Math.round(31 + wave(idx, 10, 0.8)));
  const cpl = +(spend / Math.max(leads, 1)).toFixed(2);
  const registrations = Math.max(7, Math.round(leads * 0.6));
  return { date, spend, impressions, clicks, ctr, leads, cpl, registrations };
});

export const contentData: ContentRow[] = dayKeys.map((date, idx) => {
  const newsletter = idx % 7 === 2 ? 1 : 0;
  const youtubeShorts = Math.max(0, Math.round(2 + wave(idx, 1.4, 0.9)));
  const facebookReels = Math.max(0, Math.round(2 + wave(idx, 1.1, 1.7)));
  const igReels = Math.max(0, Math.round(2 + wave(idx, 1.2, 0.4)));
  const facebookPosts = Math.max(0, Math.round(3 + wave(idx, 1.7, 1.2)));
  const fbGroupMessages = Math.max(18, Math.round(45 + wave(idx, 14, 0.2)));
  const fbNewMembers = Math.max(2, Math.round(11 + wave(idx, 4, 0.9)));
  return {
    date,
    newsletter,
    youtubeShorts,
    facebookReels,
    igReels,
    facebookPosts,
    fbGroupMessages,
    fbNewMembers,
  };
});

const weeks = Array.from({ length: 12 }, (_, index) => iso(addDays(NOW, -(index * 7)))).reverse();

export const expensesData: ExpenseRow[] = weeks.map((weekEnding, idx) => ({
  weekEnding,
  marketingSpend: Math.max(2500, Math.round(4700 + wave(idx, 900, 0.3))),
  teamCosts: Math.max(3300, Math.round(7100 + wave(idx, 760, 0.7))),
  technology: Math.max(600, Math.round(1280 + wave(idx, 280, 0.2))),
  other: Math.max(300, Math.round(900 + wave(idx, 220, 1))),
}));

export const weeklyTargets = {
  revenue: 25000,
  leads: 100,
  cplMin: 10,
  cplMax: 15,
};

export function rangeBounds(rangeKey: DateRangeKey): { start: Date; end: Date } {
  const now = new Date(NOW);
  const start = new Date(now);
  const end = new Date(now);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  if (rangeKey === "today") return { start, end };

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
    if (rangeKey === "thisWeek") return { start: monday, end: sunday };
    return {
      start: addDays(monday, -7),
      end: addDays(sunday, -7),
    };
  }

  if (rangeKey === "thisMonth") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
  };
}

export function inRange(dateValue: string, rangeKey: DateRangeKey): boolean {
  const bounds = rangeBounds(rangeKey);
  const date = new Date(`${dateValue}T12:00:00`);
  return date >= bounds.start && date <= bounds.end;
}
