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
  History,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Dashboard", icon: BarChart3, color: "text-violet-400" },
    { href: "/components", label: "Components", icon: Package, color: "text-sky-400" },
    { href: "/products", label: "Products", icon: Box, color: "text-amber-400" },
    { href: "/production", label: "Production", icon: Zap, color: "text-emerald-400" },
    { href: "/damage", label: "Damage", icon: AlertTriangle, color: "text-rose-400" },
    { href: "/stock-in", label: "Stock In", icon: TrendingUp, color: "text-teal-400" },
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
        <nav className="space-y-1">
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

        {/* Footer */}
        <div className="absolute bottom-5 left-5 right-5 border-t border-gray-100 pt-4 space-y-3">
          <div className="text-xs text-gray-500 px-1">
            <p className="font-semibold text-gray-700">BOM Manager v1.0</p>
            <p className="mt-1">Developed by <span className="text-violet-600 font-semibold">harigovind</span></p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("bom_auth");
              window.location.reload();
            }}
            className="flex items-center gap-2 text-xs text-red-500 hover:text-red-600 transition-colors py-2 px-3 hover:bg-red-50 rounded-xl w-full text-left font-medium"
          >
            <LogOut size={14} />
            Lock Session
          </button>
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
