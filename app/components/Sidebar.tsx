"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Package,
  Box,
  Zap,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  History,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AUTH_KEY, USER_KEY, formatUserName } from "@/lib/auth";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null);

  useEffect(() => {
    setLoggedInUser(localStorage.getItem(USER_KEY));
  }, []);

  const getProfile = (user: string | null) => {
    const u = user?.toLowerCase();
    if (u === "harigovind") return { initials: "HG", gradient: "from-violet-500 to-purple-600" };
    if (u === "rahul") return { initials: "RA", gradient: "from-blue-500 to-indigo-600" };
    if (u === "shilna") return { initials: "SH", gradient: "from-emerald-500 to-teal-600" };
    return { initials: "U", gradient: "from-gray-500 to-slate-600" };
  };

  const profile = getProfile(loggedInUser);

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/components", label: "Components", icon: Package },
    { href: "/products", label: "Products", icon: Box },
    { href: "/production", label: "Production", icon: Zap },
    { href: "/damage", label: "Damage", icon: AlertTriangle },
    { href: "/stock-in", label: "Stock In", icon: TrendingUp },
    { href: "/restock", label: "Restock", icon: RefreshCw },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <>
      {/* Mobile Sticky Top Navigation Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-5 z-30 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/20">
            <Box className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">BOM Manager</span>
        </div>
        
        {/* Menu Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gray-50 border border-gray-150 text-gray-700 p-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 p-5 transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 px-2">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-500/25">
            <Box className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">BOM Manager</span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 h-[calc(100vh-250px)] overflow-y-auto pr-1">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-50 text-violet-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={18} className={isActive ? "text-violet-600" : "text-gray-400"} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer with clean user profile details */}
        <div className="absolute bottom-4 left-4 right-4 border-t border-gray-100 pt-4 space-y-3 bg-white">
          {loggedInUser && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8.5 h-8.5 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0`}>
                  {profile.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 capitalize truncate">
                    {formatUserName(loggedInUser)}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">Logged In</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  localStorage.removeItem(AUTH_KEY);
                  localStorage.removeItem(USER_KEY);
                  window.location.reload();
                }}
                title="Lock Session"
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/30 transition-all cursor-pointer"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
          <div className="text-[10px] text-gray-400 px-2 flex justify-between items-center">
            <span>BOM Manager v1.0</span>
            <span>By harigovind</span>
          </div>
        </div>
      </aside>

      {/* Mobile background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-xs z-35 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
