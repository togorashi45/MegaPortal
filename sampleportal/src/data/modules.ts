import type { ModuleKey } from "@/types/portal";

export const moduleRegistry: Array<{ key: ModuleKey; label: string; path: string; description: string }> = [
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
];
