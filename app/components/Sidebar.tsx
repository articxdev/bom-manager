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
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white p-6 transition-transform duration-300 z-40 md:translate-x-0 ${
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
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon size={20} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 text-xs text-slate-400">
          <p>BOM Manager v1.0</p>
          <p className="mt-2">Factory Stock Control</p>
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
