"use client";

import { useState } from "react";
import { getComponents } from "@/app/actions/components";
import { useEffect } from "react";
import { formatNumber } from "@/lib/format";
import { AlertTriangle, Edit, Plus } from "lucide-react";
import Link from "next/link";

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
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg"
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
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600 mb-4">No components found</p>
          <Link href="/components/new" className="text-blue-600 hover:underline">
            Create first component →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Unit</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Stock</th>
                <th className="text-right py-3 px-4 font-semibold text-slate-700">Threshold</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component) => {
                const isLowStock = component.currentStock <= component.reorderThreshold;
                return (
                  <tr
                    key={component.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 ${
                      isLowStock ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {component.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{component.category}</td>
                    <td className="py-3 px-4 text-slate-600">{component.unit}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatNumber(component.currentStock)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatNumber(component.reorderThreshold)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <AlertTriangle size={16} /> Low
                        </span>
                      ) : (
                        <span className="text-green-600">✓ OK</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex gap-2 justify-center">
                        <Link
                          href={`/components/${component.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </Link>
                      </div>
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
