import type { ModuleKey } from "@/types/portal";

export interface PortalModule {
  key: ModuleKey;
  label: string;
  path: string;
  description: string;
}

export const moduleRegistry: PortalModule[] = [
  { key: "dashboard", label: "Dashboard", path: "/dashboard", description: "Quick links and status" },
  { key: "mission-control", label: "Mission Control", path: "/mission-control", description: "Ops activity and cron" },
  { key: "kpi", label: "KPI Tracker", path: "/kpi", description: "Company performance metrics" },
  { key: "gps", label: "GPS Framework", path: "/gps", description: "Goal, Priorities, Standards" },
  { key: "tasks", label: "Kanban Tasks", path: "/tasks", description: "Task boards and cards" },
  { key: "wiki", label: "Company Wiki", path: "/wiki", description: "Knowledge base" },
  { key: "assets", label: "Net Worth & Assets", path: "/assets", description: "PFS and REO tracker" },
  { key: "calendar", label: "Company Calendar", path: "/calendar", description: "Team events" },
  { key: "training", label: "Training Hub", path: "/training", description: "Learning library" },
  { key: "hr", label: "HR Links", path: "/hr", description: "Hubstaff and Clockify" },
  { key: "admin", label: "Admin Panel", path: "/admin", description: "User and access control" },
  { key: "decisions", label: "Decision Journal", path: "/decisions", description: "Executive decision intelligence" },
  { key: "deal-analyzer", label: "Deal Analyzer", path: "/deal-analyzer", description: "Underwrite wholesale/flip/rental deals" },
  { key: "comp-tracker", label: "Comp & Market Tracker", path: "/comp-tracker", description: "Comparable sales and market trends" },
  { key: "contractor-directory", label: "Contractor Directory", path: "/contractor-directory", description: "Vendor contacts and performance" },
  { key: "appfolio-dashboard", label: "Appfolio Dashboard", path: "/appfolio-dashboard", description: "Property management snapshot" },
  { key: "tax-insurance", label: "Tax & Insurance", path: "/tax-insurance", description: "Property obligations and renewals" },
  { key: "note-tracker", label: "Note Tracker", path: "/note-tracker", description: "Mortgage note portfolio operations" },
  { key: "flip-tracker", label: "Flip Tracker", path: "/flip-tracker", description: "Project-level flip execution tracking" },
  { key: "cashflow", label: "Cash Flow Tool", path: "/cashflow", description: "12/24 month scenario projections" },
  { key: "rehab-scope", label: "Rehab Scope Tracker", path: "/rehab-scope", description: "Room-level scope and budgets" },
  { key: "lending-capital-tracker", label: "Lending & Capital", path: "/lending-capital-tracker", description: "Debt exposure and maturities" },
  { key: "document-vault", label: "Document Vault", path: "/document-vault", description: "Structured Drive index and search" },
  { key: "health-tracker", label: "Health Tracker", path: "/health-tracker", description: "Private biometrics and habits" },
  { key: "house-manual", label: "House Manual", path: "/house-manual", description: "Home systems and maintenance" },
  { key: "family-manual", label: "Family Manual", path: "/family-manual", description: "Family playbooks and reminders" },
  { key: "flip-forecasting-dashboard", label: "Flip Forecasting", path: "/flip-forecasting-dashboard", description: "Flagship financial forecasting" },
  { key: "automation-engine", label: "Automation Engine", path: "/automation-engine", description: "Cross-module sync and orchestration" },
];
