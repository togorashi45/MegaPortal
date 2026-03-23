"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

type Module = { name: string; href: string; icon: string };
type Category = { title: string; modules: Module[] };

const categories: Category[] = [
  {
    title: "Core Portal",
    modules: [
      { name: "Dashboard", href: "/dashboard", icon: "🏠" },
      { name: "Mission Control", href: "/dashboard/mission-control", icon: "🚀" },
      { name: "KPI", href: "/dashboard/kpi", icon: "📊" },
      { name: "GPS", href: "/dashboard/gps", icon: "🧭" },
      { name: "Kanban", href: "/dashboard/tasks", icon: "📋" },
      { name: "Wiki", href: "/dashboard/wiki", icon: "📚" },
      { name: "Calendar", href: "/dashboard/calendar", icon: "📅" },
      { name: "Training", href: "/dashboard/training", icon: "🎓" },
      { name: "HR", href: "/dashboard/hr", icon: "👥" },
      { name: "Admin", href: "/dashboard/admin", icon: "⚙️" },
      { name: "Automation", href: "/dashboard/automation", icon: "⚡" },
    ],
  },
  {
    title: "Operations",
    modules: [
      { name: "Assets", href: "/dashboard/assets", icon: "🏢" },
      { name: "Decisions", href: "/dashboard/decisions", icon: "🤔" },
      { name: "Deal Analyzer", href: "/dashboard/deal-analyzer", icon: "📈" },
      { name: "Comps", href: "/dashboard/comps", icon: "🔍" },
      { name: "Contractors", href: "/dashboard/contractors", icon: "🔨" },
      { name: "Appfolio", href: "/dashboard/appfolio", icon: "🏢" },
      { name: "Tax/Insurance", href: "/dashboard/tax-insurance", icon: "📑" },
      { name: "Notes", href: "/dashboard/notes", icon: "🗒️" },
      { name: "Flips", href: "/dashboard/flips", icon: "🔄" },
      { name: "Cash Flow", href: "/dashboard/cash-flow", icon: "💰" },
      { name: "Rehab", href: "/dashboard/rehab", icon: "🏗️" },
      { name: "Documents", href: "/dashboard/documents", icon: "📂" },
    ],
  },
  {
    title: "Capital & Finance",
    modules: [
      { name: "Lending", href: "/dashboard/lending", icon: "💸" },
      { name: "Flip Forecasting", href: "/dashboard/flip-forecasting", icon: "📉" },
    ],
  },
  {
    title: "Private/Personal",
    modules: [
      { name: "Health", href: "/dashboard/health", icon: "🏃" },
      { name: "House Manual", href: "/dashboard/house-manual", icon: "🏠" },
      { name: "Family Manual", href: "/dashboard/family-manual", icon: "👨‍👩‍👧‍👦" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { username, logout } = useAuth();
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Core Portal": true,
    "Operations": false,
    "Capital & Finance": false,
    "Private/Personal": false,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="w-72 h-screen bg-[#242830] border-r border-[#2A2E38] flex flex-col transition-all duration-300 shadow-xl z-20">
      {/* Header */}
      <div className="p-6 border-b border-[#2A2E38]">
        <h1 className="text-xl font-bold text-terracotta uppercase tracking-wider">THE REAL ESTATE RESET</h1>
        <p className="text-sm text-[#8B8FA3] mt-1 font-medium">Mission Control</p>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search modules..."
            className="w-full bg-[#1A1D26] border border-[#2A2E38] rounded-lg py-2 px-4 text-sm text-[#F0F0F0] placeholder-[#8B8FA3] focus:outline-none focus:border-terracotta/50 transition-colors"
          />
          <span className="absolute right-3 top-2.5 text-[#8B8FA3] text-sm">⌘K</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#2A2E38] scrollbar-track-transparent">
        <nav className="px-3 pb-6 space-y-4">
          {categories.map((category) => (
            <div key={category.title} className="space-y-1">
              <button
                onClick={() => toggleGroup(category.title)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#8B8FA3] uppercase tracking-wider hover:text-[#F0F0F0] transition-colors"
              >
                <span>{category.title}</span>
                <span className={`transform transition-transform duration-300 ${openGroups[category.title] ? "rotate-180" : ""}`}>▼</span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openGroups[category.title] ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-1 py-1">
                  {category.modules.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? "bg-terracotta/10 text-terracotta font-medium border-l-2 border-terracotta ml-[1px]"
                            : "text-[#F0F0F0]/80 hover:bg-[#1A1D26] hover:text-[#F0F0F0] ml-[3px]"
                        }`}
                      >
                        <span className="text-lg opacity-80 group-hover:scale-110 transition-transform duration-200">
                          {item.icon}
                        </span>
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User info and logout */}
      <div className="p-4 border-t border-[#2A2E38] bg-[#242830]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-darkgreen flex items-center justify-center text-white font-bold shadow-md border border-white/10">
              {username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-[#F0F0F0]">{username || "User"}</span>
              <span className="text-xs text-green-400 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulseBadge"></span>
                Online
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-[#1A1D26] hover:bg-[#2A2E38] border border-[#2A2E38] text-[#8B8FA3] hover:text-[#F0F0F0] rounded-lg transition-all duration-200 text-sm font-medium shadow-sm hover:shadow"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
