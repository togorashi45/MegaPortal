import type {
  ApiConnection,
  CampaignRow,
  ContentRow,
  ConversionRow,
  ExpenseRow,
  LeadRow,
  MetaRow,
  ReferralLogRow,
  ReferrerRow,
  RevenueRow,
} from "./types";

export const NOW = new Date("2026-02-19T11:30:00-07:00");

const weekTarget = {
  revenue: 25000,
  leads: 100,
  cplMin: 10,
  cplMax: 15,
};

export const weeklyTargets = weekTarget;

function wave(seed: number, amplitude: number, shift = 0): number {
  return Math.sin(seed * 0.62 + shift) * amplitude;
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function buildDates(days: number, endDate: Date): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) out.push(toISO(addDays(endDate, -i)));
  return out;
}

export const dayKeys = buildDates(60, NOW);

export const revenueData: RevenueRow[] = dayKeys.map((date, idx) => {
  const highTicket = Math.max(1200, Math.round(4800 + wave(idx, 1500, 0.4)));
  const paymentPlan = Math.max(400, Math.round(1100 + wave(idx, 420, 0.2)));
  const mrr = Math.max(350, Math.round(760 + wave(idx, 280, 1.1)));
  const affiliate = Math.max(0, Math.round(310 + wave(idx, 210, 0.7)));
  const other = idx % 9 === 0 ? 220 : 0;
  return {
    date,
    highTicket,
    paymentPlan,
    mrr,
    affiliate,
    other,
    comments: idx % 7 === 0 ? "Manual adjustment from bank delay" : "",
  };
});

export const leadData: LeadRow[] = dayKeys.map((date, idx) => {
  const paidAds = Math.max(8, Math.round(28 + wave(idx, 11, 0.8)));
  const organic = Math.max(2, Math.round(9 + wave(idx, 4, 0.3)));
  const prospecting = Math.max(1, Math.round(6 + wave(idx, 3.3, 0.9)));
  const facebookGroup = Math.max(0, Math.round(4 + wave(idx, 2.1, 1.4)));
  const referrals = Math.max(1, Math.round(5 + wave(idx, 2.4, 2)));
  const newsletter = Math.max(0, Math.round(3 + wave(idx, 1.8, 1.8)));
  return {
    date,
    paidAds,
    organic,
    prospecting,
    facebookGroup,
    referrals,
    newsletter,
    comments: idx % 8 === 0 ? "Weekend catch-up entered Monday" : "",
  };
});

export const metaData: MetaRow[] = dayKeys.map((date, idx) => {
  const spend = Math.max(250, Math.round(510 + wave(idx, 190, 0.3)));
  const impressions = Math.max(12000, Math.round(17000 + wave(idx, 5200, 0.7)));
  const ctr = Math.max(0.5, +(1.2 + wave(idx, 0.55, 0.5)).toFixed(2));
  const clicks = Math.round((impressions * ctr) / 100);
  const leads = Math.max(10, Math.round(30 + wave(idx, 10.8, 0.8)));
  const cpl = +(spend / leads).toFixed(2);
  const registrations = Math.max(7, Math.round(leads * 0.58));
  return { date, spend, impressions, clicks, ctr, leads, cpl, registrations };
});

export const contentData: ContentRow[] = dayKeys.map((date, idx) => {
  const newsletter = idx % 7 === 2 ? 1 : 0;
  const youtubeShorts = Math.max(0, Math.round(2 + wave(idx, 1.5, 0.9)));
  const facebookReels = Math.max(0, Math.round(2 + wave(idx, 1.2, 1.7)));
  const igReels = Math.max(0, Math.round(2 + wave(idx, 1.3, 0.3)));
  const facebookPosts = Math.max(0, Math.round(3 + wave(idx, 1.8, 1.1)));
  const fbGroupMessages = Math.max(18, Math.round(46 + wave(idx, 15, 0.2)));
  const fbNewMembers = Math.max(2, Math.round(11 + wave(idx, 4.2, 0.9)));
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

const weekKeys = Array.from({ length: 12 }, (_, idx) => {
  const end = addDays(NOW, -(idx * 7));
  return toISO(end);
}).reverse();

export const expensesData: ExpenseRow[] = weekKeys.map((weekEnding, idx) => {
  const marketingSpend = Math.max(2600, Math.round(4800 + wave(idx, 900, 0.3)));
  const teamCosts = Math.max(3400, Math.round(7200 + wave(idx, 800, 0.7)));
  const technology = Math.max(650, Math.round(1350 + wave(idx, 300, 0.2)));
  const other = Math.max(300, Math.round(870 + wave(idx, 210, 1)));
  return { weekEnding, marketingSpend, teamCosts, technology, other };
});

export const campaignData: CampaignRow[] = [
  {
    name: "Seller Pain Point V3",
    status: "Active",
    dailySpend: 186,
    leads: 10,
    cpl: 18.6,
    notes: "Testing new hook",
    highCplStreak: 2,
  },
  {
    name: "Case Study Reel",
    status: "Active",
    dailySpend: 141,
    leads: 13,
    cpl: 10.85,
    notes: "Strong CTR",
    highCplStreak: 0,
  },
  {
    name: "Webinar Retargeting",
    status: "Paused",
    dailySpend: 98,
    leads: 4,
    cpl: 24.5,
    notes: "Audience fatigue",
    highCplStreak: 3,
  },
  {
    name: "DM Funnel Lead Form",
    status: "Active",
    dailySpend: 167,
    leads: 14,
    cpl: 11.93,
    notes: "Stable performer",
    highCplStreak: 0,
  },
];

export const referrers: ReferrerRow[] = [
  {
    name: "Ashley Mason",
    email: "ashley@partnermail.com",
    referrals: 22,
    conversions: 6,
    revenue: 29400,
    commission: 2940,
    commissionRate: 10,
    status: "Active",
  },
  {
    name: "Chris Long",
    email: "chris@partnermail.com",
    referrals: 18,
    conversions: 5,
    revenue: 24750,
    commission: 2475,
    commissionRate: 10,
    status: "Active",
  },
  {
    name: "Nadia Patel",
    email: "nadia@partnermail.com",
    referrals: 16,
    conversions: 4,
    revenue: 17800,
    commission: 1780,
    commissionRate: 10,
    status: "Active",
  },
  {
    name: "Jordan Tate",
    email: "jordan@partnermail.com",
    referrals: 9,
    conversions: 2,
    revenue: 9800,
    commission: 980,
    commissionRate: 10,
    status: "Inactive",
  },
];

export const referralLog: ReferralLogRow[] = [
  {
    date: "2026-02-18",
    referrer: "Ashley Mason",
    referred: "Ryan W.",
    offer: "High Ticket",
    status: "Converted",
    revenue: 4900,
    commission: 490,
  },
  {
    date: "2026-02-17",
    referrer: "Chris Long",
    referred: "Mia S.",
    offer: "Payment Plan",
    status: "Converted",
    revenue: 2500,
    commission: 250,
  },
  {
    date: "2026-02-16",
    referrer: "Nadia Patel",
    referred: "Kyle D.",
    offer: "Community",
    status: "Pending",
    revenue: 0,
    commission: 0,
  },
  {
    date: "2026-02-15",
    referrer: "Ashley Mason",
    referred: "Lena R.",
    offer: "High Ticket",
    status: "Lost",
    revenue: 0,
    commission: 0,
  },
  {
    date: "2026-02-14",
    referrer: "Chris Long",
    referred: "Oscar N.",
    offer: "MRR",
    status: "Converted",
    revenue: 1200,
    commission: 120,
  },
];

export const conversionData: ConversionRow[] = dayKeys.slice(-30).map((date, idx) => {
  const sourceOptions: ConversionRow["source"][] = [
    "Paid Ads",
    "Organic Social",
    "Referral",
    "Newsletter",
    "Prospecting",
  ];
  const offerOptions: ConversionRow["offer"][] = ["High Ticket", "Payment Plan", "Community"];
  const source = sourceOptions[idx % sourceOptions.length];
  const offer = offerOptions[idx % offerOptions.length];
  const daysToConvert = Math.max(2, Math.round(9 + wave(idx, 4.6, 1.2)));
  const revenue = offer === "High Ticket" ? 4900 : offer === "Payment Plan" ? 2500 : 697;
  return {
    date,
    source,
    path: "Lead Form > Call Booked > Closed",
    daysToConvert,
    revenue,
    offer,
  };
});

export const apiConnections: ApiConnection[] = [
  {
    name: "GoHighLevel",
    status: "Connected",
    frequency: "Every 15 min",
    lastSync: "Feb 19, 2026 4:15 AM MST",
  },
  {
    name: "Meta Ads",
    status: "Connected",
    frequency: "Every 30 min",
    lastSync: "Feb 19, 2026 4:00 AM MST",
  },
  {
    name: "QuickBooks",
    status: "Needs Auth",
    frequency: "Every 1 hour",
    lastSync: "Feb 18, 2026 11:00 PM MST",
  },
  {
    name: "Stripe",
    status: "Connected",
    frequency: "Webhooks + hourly",
    lastSync: "Feb 19, 2026 4:24 AM MST",
  },
  {
    name: "PayPal",
    status: "Connected",
    frequency: "Webhooks + hourly",
    lastSync: "Feb 19, 2026 4:02 AM MST",
  },
  {
    name: "Beehiiv",
    status: "Error",
    frequency: "Every 1 hour",
    lastSync: "Feb 19, 2026 3:05 AM MST",
  },
  {
    name: "YouTube",
    status: "Connected",
    frequency: "Every 2 hours",
    lastSync: "Feb 19, 2026 2:58 AM MST",
  },
  {
    name: "Instagram",
    status: "Connected",
    frequency: "Every 2 hours",
    lastSync: "Feb 19, 2026 2:54 AM MST",
  },
];
