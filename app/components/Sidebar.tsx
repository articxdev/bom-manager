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
    { href: "/", label: "Dashboard", icon: BarChart3 },
    { href: "/components", label: "Components", icon: Package },
    { href: "/products", label: "Products", icon: Box },
    { href: "/production", label: "Production", icon: Zap },
    { href: "/damage", label: "Damage", icon: AlertTriangle },
    { href: "/stock-in", label: "Stock In", icon: TrendingUp },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-950 to-slate-900 border-r border-slate-800 text-white p-6 transition-transform duration-300 z-40 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <Box className="w-6 h-6 text-blue-400" />
          BOM Manager
        </h1>

        <nav className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 border-t border-slate-800 pt-4 flex flex-col gap-3">
          <div className="text-xs text-slate-400">
            <p className="font-semibold text-slate-300">BOM Manager v1.0</p>
            <p className="mt-1">Developed by <span className="text-blue-400 font-medium">harigovind</span></p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("bom_auth");
              window.location.reload();
            }}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors py-2 px-3 hover:bg-red-500/10 rounded-lg mt-1 w-full text-left font-medium"
          >
            <LogOut size={14} />
            Lock Session
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
