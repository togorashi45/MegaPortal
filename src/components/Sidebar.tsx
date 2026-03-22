"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { name: "Tasks", href: "/dashboard/tasks", icon: "📋" },
  { name: "Calendar", href: "/dashboard/calendar", icon: "📅" },
  { name: "Memory", href: "/dashboard/memory", icon: "🧠" },
  { name: "Team", href: "/dashboard/team", icon: "👥" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { username, logout } = useAuth();

  return (
    <div className="w-64 h-screen bg-[#242424] border-r border-gray-800 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-terracotta">Mission Control</h1>
        <p className="text-sm text-gray-400 mt-1">Agent Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-terracotta text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-darkgreen flex items-center justify-center text-white font-bold">
              {username?.[0].toUpperCase()}
            </div>
            <span className="text-sm text-gray-300">{username}</span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
