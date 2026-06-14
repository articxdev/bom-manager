"use client";

import { useEffect, useState } from "react";
import { getDashboardData } from "./actions/dashboard";
import { LoadingSpinner, EmptyState } from "./components/ui";
import { formatNumber, formatDate } from "@/lib/format";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingUp,
  Package,
  Activity,
} from "lucide-react";

interface DashboardData {
  totalComponents: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockComponents: any[];
  recentTransactions: any[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const result = await getDashboardData();
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to load dashboard data");
      }
      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!data) return <EmptyState title="No Data" description="Failed to load dashboard data" />;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Real-time factory stock metrics and tracking</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Components Card */}
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Components</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {formatNumber(data.totalComponents, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/components"
            className="text-blue-600 text-xs font-semibold mt-6 flex items-center gap-1 hover:gap-2 transition-all"
          >
            View Inventory Details <span className="font-mono">→</span>
          </Link>
        </div>

        {/* Total Products Card */}
        <div className="bg-gradient-to-br from-emerald-50/80 via-white to-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Products</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {formatNumber(data.totalProducts, 0)}
              </p>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/products"
            className="text-emerald-600 text-xs font-semibold mt-6 flex items-center gap-1 hover:gap-2 transition-all"
          >
            Manage Catalog & BOMs <span className="font-mono">→</span>
          </Link>
        </div>

        {/* Low Stock Items Card */}
        <div className="bg-gradient-to-br from-rose-50/80 via-white to-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-[1.01] duration-300 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Low Stock Items</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">
                {formatNumber(data.lowStockCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <Link
            href="/components"
            className="text-rose-600 text-xs font-semibold mt-6 flex items-center gap-1 hover:gap-2 transition-all"
          >
            Review Reorders <span className="font-mono">→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Low Stock Alert
            </h2>
            {data.lowStockComponents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {data.lowStockComponents.slice(0, 5).map((component) => (
                  <div key={component.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{component.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Threshold: {formatNumber(component.reorderThreshold)}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      {formatNumber(component.currentStock)} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-4">All components are well stocked ✓</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Activity
            </h2>
            {data.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-150 bg-slate-50/50">
                      <th className="text-left py-3 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Component</th>
                      <th className="text-left py-3 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Type</th>
                      <th className="text-right py-3 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Change</th>
                      <th className="text-right py-3 px-6 font-semibold text-slate-500 text-xs uppercase tracking-wider">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentTransactions.slice(0, 10).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3 px-6 text-slate-500 text-xs">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="py-3 px-6 font-medium text-slate-900">
                          {tx.component.name}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              tx.type === "STOCK_IN"
                                ? "bg-green-50 text-green-700"
                                : tx.type === "PRODUCTION"
                                  ? "bg-blue-50 text-blue-700"
                                  : tx.type === "DAMAGE"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-50 text-slate-700"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right font-medium">
                          <span
                            className={
                              tx.quantityChange > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {tx.quantityChange > 0 ? "+" : ""}
                            {formatNumber(tx.quantityChange)}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right font-semibold text-slate-900">
                          {formatNumber(tx.resultingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm py-4">No transactions recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
