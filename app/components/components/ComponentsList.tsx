"use client";

import { useState } from "react";
import { getComponents } from "@/app/actions/components";
import { useEffect } from "react";
import { formatNumber } from "@/lib/format";
import { AlertTriangle, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { formatUserName } from "@/lib/auth";

interface ComponentsListProps {
  onEdit?: (component: any) => void;
}

export function ComponentsList({ onEdit }: ComponentsListProps) {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadComponents();
  }, [search, category]);

  async function loadComponents() {
    setLoading(true);
    const result = await getComponents(search || undefined, category || undefined);
    if (result.success && result.data) {
      setComponents(result.data);
      // Extract unique categories
      const uniqueCategories = [...new Set(result.data.map((c) => c.category))];
      setCategories(uniqueCategories as string[]);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {components.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4 text-sm">No components found</p>
          <Link href="/components/new" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
            Create first component →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Category</th>
                <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Unit</th>
                <th className="text-right py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                <th className="text-right py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Threshold</th>
                <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Entered By</th>
                <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {components.map((component) => {
                const isLowStock = component.currentStock <= component.reorderThreshold;
                return (
                  <tr
                    key={component.id}
                    className={`hover:bg-gray-50/50 transition-colors ${
                      isLowStock ? "bg-rose-50/30" : ""
                    }`}
                  >
                    <td className="py-3.5 px-5 font-semibold text-gray-800">
                      {component.name}
                    </td>
                    <td className="py-3.5 px-5 text-gray-600">{component.category}</td>
                    <td className="py-3.5 px-5 text-gray-600">{component.unit}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-gray-800">
                      {formatNumber(component.currentStock)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-gray-500">
                      {formatNumber(component.reorderThreshold)}
                    </td>
                    <td className="py-3.5 px-5 text-gray-600 text-xs capitalize">
                      {component.enteredBy ? formatUserName(component.enteredBy) : "—"}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={12} /> Low
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">✓ OK</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Link
                        href={`/components/${component.id}`}
                        className="inline-flex items-center gap-1 text-violet-600 hover:text-violet-700 font-medium text-xs"
                      >
                        <Edit size={14} />
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
