"use client";

import Link from "next/link";

const kpiData = [
  { label: "Modules Live", value: "24", trend: "+2 this week" },
  { label: "APIs Connected", value: "8", trend: "100% uptime" },
  { label: "Tasks Open", value: "14", trend: "5 high priority", warning: true },
  { label: "Team Online", value: "6", trend: "Across 3 timezones" },
];

const moduleCards = [
  { name: "Mission Control", icon: "🚀", status: "Live", desc: "Central command for all agent activities.", href: "/dashboard/mission-control" },
  { name: "Deal Analyzer", icon: "📈", status: "Live", desc: "Interactive underwriting and deal analysis.", href: "/dashboard/deal-analyzer" },
  { name: "Kanban", icon: "📋", status: "Live", desc: "Task tracking and project management.", href: "/dashboard/tasks" },
  { name: "Automation", icon: "⚡", status: "In Progress", desc: "Configure and monitor background jobs.", href: "/dashboard/automation" },
  { name: "Assets", icon: "🏢", status: "Live", desc: "Manage property portfolios and details.", href: "/dashboard/assets" },
  { name: "Comps", icon: "🔍", status: "Planned", desc: "Automated market comparisons.", href: "/dashboard/comps" },
  { name: "Cash Flow", icon: "💰", status: "Live", desc: "Real-time financial tracking and projections.", href: "/dashboard/cash-flow" },
  { name: "Flip Forecasting", icon: "📉", status: "In Progress", desc: "Time and cost estimates for rehabs.", href: "/dashboard/flip-forecasting" },
];

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeInUp">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F0F0F0] tracking-tight">Welcome back, Agent</h1>
          <p className="text-[#8B8FA3] mt-2">Here's what's happening in your portal today.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="glass-card rounded-xl p-5 hover:scale-[1.02] transition-transform duration-200">
            <p className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider">{kpi.label}</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#F0F0F0]">{kpi.value}</span>
            </div>
            <p className={`text-xs mt-2 ${kpi.warning ? 'text-gold' : 'text-green-400'}`}>
              {kpi.trend}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Bento Grid */}
        <div className="xl:col-span-3 space-y-4">
          <h2 className="text-xl font-semibold text-[#F0F0F0]">Core Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCards.map((mod, i) => {
              const isLive = mod.status === "Live";
              const isInProgress = mod.status === "In Progress";
              
              return (
                <Link key={i} href={mod.href} className="block group h-full">
                  <div className="glass-card rounded-xl p-5 h-full transition-all duration-200 group-hover:scale-[1.01] group-hover:border-terracotta/40 group-hover:shadow-[0_0_15px_rgba(198,94,44,0.1)]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-[#242830] flex items-center justify-center text-xl shadow-sm border border-[#2A2E38] group-hover:bg-terracotta/10 transition-colors duration-300">
                        {mod.icon}
                      </div>
                      <div className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border flex items-center gap-1.5
                        ${isLive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                          isInProgress ? 'bg-gold/10 text-gold border-gold/20' : 
                          'bg-[#2A2E38]/50 text-[#8B8FA3] border-[#2A2E38]'}
                      `}>
                        {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulseBadge"></span>}
                        {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>}
                        {!isLive && !isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-[#8B8FA3]"></span>}
                        {mod.status}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#F0F0F0] mb-1 group-hover:text-terracotta transition-colors">{mod.name}</h3>
                      <p className="text-sm text-[#8B8FA3] line-clamp-2">{mod.desc}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions / Sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold text-[#F0F0F0]">Quick Actions</h2>
          <div className="glass-card rounded-xl p-5 space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-terracotta hover:bg-terracotta/90 text-white font-medium transition-colors shadow-sm">
              <span>Create Task</span>
              <span className="text-lg">＋</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-[#242830] hover:bg-[#2A2E38] border border-[#2A2E38] text-[#F0F0F0] font-medium transition-colors">
              <span>View Calendar</span>
              <span className="text-lg">📅</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg bg-[#242830] hover:bg-[#2A2E38] border border-[#2A2E38] text-[#F0F0F0] font-medium transition-colors">
              <span>Open Wiki</span>
              <span className="text-lg">📚</span>
            </button>
          </div>

          <div className="glass-card rounded-xl p-5 mt-4">
            <h3 className="text-sm font-semibold text-[#8B8FA3] uppercase tracking-wider mb-4">Recent Activity</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#2A2E38] before:to-transparent">
              {/* Timeline Items */}
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#1A1D26] bg-terracotta shadow shrink-0 md:order-1 relative z-10 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 p-3 rounded-lg bg-[#242830] border border-[#2A2E38] text-sm">
                  <span className="font-semibold text-[#F0F0F0]">Deal Analyzer</span> activated for 123 Main St
                  <p className="text-xs text-[#8B8FA3] mt-1">10 min ago</p>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-[#1A1D26] bg-[#2A2E38] shadow shrink-0 md:order-1 relative z-10 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-4 md:ml-0 p-3 rounded-lg bg-[#242830] border border-[#2A2E38] text-sm">
                  New document added to <span className="font-semibold text-[#F0F0F0]">House Manual</span>
                  <p className="text-xs text-[#8B8FA3] mt-1">2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
