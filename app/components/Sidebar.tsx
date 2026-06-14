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
    if (u === "harigovind") return { initials: "HG", role: "Administrator", gradient: "from-violet-500 to-purple-600" };
    if (u === "rahul") return { initials: "RA", role: "Inventory Manager", gradient: "from-blue-500 to-indigo-600" };
    if (u === "shilna") return { initials: "SH", role: "Production Lead", gradient: "from-emerald-500 to-teal-600" };
    return { initials: "U", role: "User", gradient: "from-gray-500 to-slate-600" };
  };

  const profile = getProfile(loggedInUser);

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3, color: "text-violet-400" },
    { href: "/components", label: "Components", icon: Package, color: "text-sky-400" },
    { href: "/products", label: "Products", icon: Box, color: "text-amber-400" },
    { href: "/production", label: "Production", icon: Zap, color: "text-emerald-400" },
    { href: "/damage", label: "Damage", icon: AlertTriangle, color: "text-rose-400" },
    { href: "/stock-in", label: "Stock In", icon: TrendingUp, color: "text-teal-400" },
    { href: "/restock", label: "Restock", icon: RefreshCw, color: "text-emerald-400" },
    { href: "/history", label: "History", icon: History, color: "text-indigo-400" },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden bg-violet-600 text-white p-2.5 rounded-xl shadow-lg shadow-violet-600/30"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
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

        {/* Navigation */}
        <nav className="space-y-1 h-[calc(100vh-270px)] overflow-y-auto pr-1">
          {links.map(({ href, label, icon: Icon, color }) => {
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

        {/* Footer with user profile card */}
        <div className="absolute bottom-4 left-4 right-4 border-t border-gray-100 pt-4 space-y-3">
          {loggedInUser && (
            <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${profile.gradient} flex items-center justify-center font-bold text-xs text-white shadow-sm`}>
                  {profile.initials}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 capitalize truncate">
                    {formatUserName(loggedInUser)}
                  </h4>
                  <p className="text-[10px] text-gray-500 font-medium truncate">
                    {profile.role}
                  </p>
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
                <LogOut size={14} />
              </button>
            </div>
          )}
          <div className="text-[10px] text-gray-400 px-2 flex justify-between items-center">
            <span>BOM Manager v1.0</span>
            <span>By harigovind</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
