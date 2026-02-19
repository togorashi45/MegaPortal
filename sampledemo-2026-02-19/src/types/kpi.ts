export type DateRangeKey =
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth";

export interface RevenueRow {
  date: string;
  highTicket: number;
  paymentPlan: number;
  mrr: number;
  affiliate: number;
  other: number;
  comments?: string;
}

export interface LeadRow {
  date: string;
  paidAds: number;
  organic: number;
  prospecting: number;
  facebookGroup: number;
  referrals: number;
  newsletter: number;
  comments?: string;
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
