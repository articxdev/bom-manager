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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Components</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatNumber(data.totalComponents, 0)}
              </p>
            </div>
            <Package className="w-12 h-12 text-blue-200" />
          </div>
          <Link
            href="/components"
            className="text-blue-600 text-sm font-medium mt-4 inline-block hover:underline"
          >
            View Components →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatNumber(data.totalProducts, 0)}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-200" />
          </div>
          <Link
            href="/products"
            className="text-green-600 text-sm font-medium mt-4 inline-block hover:underline"
          >
            View Products →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Low Stock Items</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {formatNumber(data.lowStockCount, 0)}
              </p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-200" />
          </div>
          <Link
            href="/components"
            className="text-red-600 text-sm font-medium mt-4 inline-block hover:underline"
          >
            Reorder Now →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alert */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Low Stock Alert
            </h2>
            {data.lowStockComponents.length > 0 ? (
              <div className="space-y-3">
                {data.lowStockComponents.slice(0, 5).map((component) => (
                  <div key={component.id} className="border-l-2 border-red-500 pl-3 py-1">
                    <p className="font-medium text-sm text-slate-900">{component.name}</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Stock: {formatNumber(component.currentStock)} / Threshold:{" "}
                      {formatNumber(component.reorderThreshold)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm">All components are well stocked ✓</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Recent Activity
            </h2>
            {data.recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Date</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Component</th>
                      <th className="text-left py-2 px-2 font-semibold text-slate-600">Type</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-600">Change</th>
                      <th className="text-right py-2 px-2 font-semibold text-slate-600">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentTransactions.slice(0, 10).map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-2 text-slate-600">
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className="py-3 px-2 font-medium text-slate-900">
                          {tx.component.name}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              tx.type === "STOCK_IN"
                                ? "bg-green-100 text-green-800"
                                : tx.type === "PRODUCTION"
                                  ? "bg-blue-100 text-blue-800"
                                  : tx.type === "DAMAGE"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span
                            className={
                              tx.quantityChange > 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {tx.quantityChange > 0 ? "+" : ""}
                            {formatNumber(tx.quantityChange)}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-slate-900">
                          {formatNumber(tx.resultingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-600 text-sm">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
