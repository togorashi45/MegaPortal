export type DateRangeKey =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth";

export type ViewKey =
  | "dashboard"
  | "revenue"
  | "leads"
  | "meta"
  | "content"
  | "expenses"
  | "referrals"
  | "conversions"
  | "settings";

export type UserRole = "admin" | "editor" | "viewer";

export interface RevenueRow {
  date: string;
  highTicket: number;
  paymentPlan: number;
  mrr: number;
  affiliate: number;
  other: number;
  comments: string;
}

export interface LeadRow {
  date: string;
  paidAds: number;
  organic: number;
  prospecting: number;
  facebookGroup: number;
  referrals: number;
  newsletter: number;
  comments: string;
}

export interface MetaRow {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  leads: number;
  cpl: number;
  registrations: number;
}

export interface CampaignRow {
  name: string;
  status: "Active" | "Paused" | "Off";
  dailySpend: number;
  leads: number;
  cpl: number;
  notes: string;
  highCplStreak: number;
}

export interface ContentRow {
  date: string;
  newsletter: number;
  youtubeShorts: number;
  facebookReels: number;
  igReels: number;
  facebookPosts: number;
  fbGroupMessages: number;
  fbNewMembers: number;
}

export interface ExpenseRow {
  weekEnding: string;
  marketingSpend: number;
  teamCosts: number;
  technology: number;
  other: number;
}

export interface ReferrerRow {
  name: string;
  referrals: number;
  conversions: number;
  revenue: number;
  commission: number;
  status: "Active" | "Inactive";
  email: string;
  commissionRate: number;
}

export interface ReferralLogRow {
  date: string;
  referrer: string;
  referred: string;
  offer: "High Ticket" | "Payment Plan" | "Community" | "MRR";
  status: "Converted" | "Pending" | "Lost";
  revenue: number;
  commission: number;
}

export interface ConversionRow {
  date: string;
  source: "Paid Ads" | "Organic Social" | "Referral" | "Newsletter" | "Prospecting";
  path: string;
  daysToConvert: number;
  revenue: number;
  offer: "High Ticket" | "Payment Plan" | "Community";
}

export interface ApiConnection {
  name: string;
  status: "Connected" | "Needs Auth" | "Error";
  frequency: string;
  lastSync: string;
}
