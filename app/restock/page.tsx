"use client";

import { useState, useEffect } from "react";
import { getComponents } from "@/app/actions/components";
import { recordStockIn } from "@/app/actions/transactions";
import { formatNumber } from "@/lib/format";
import { getLoggedInUser } from "@/lib/auth";
import { AlertTriangle, Package } from "lucide-react";

export default function RestockPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockQuantities, setRestockQuantities] = useState<Record<string, number>>({});
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Quick Restock Form State
  const [quickComponentId, setQuickComponentId] = useState("");
  const [quickQuantity, setQuickQuantity] = useState<string | number>("");

  useEffect(() => {
    loadComponents();
  }, []);

  async function loadComponents() {
    setLoading(true);
    const result = await getComponents();
    if (result.success && result.data) {
      const sorted = result.data.sort(
        (a: any, b: any) =>
          a.currentStock / (a.reorderThreshold || 1) -
          b.currentStock / (b.reorderThreshold || 1)
      );
      setComponents(sorted);
    }
    setLoading(false);
  }

  async function handleRestock(componentId: string) {
    const quantity = restockQuantities[componentId];
    if (!quantity || quantity <= 0) return;

    setRestockingId(componentId);
    setMessage(null);

    const result = await recordStockIn(
      componentId,
      quantity,
      "Restock",
      getLoggedInUser() || undefined
    );

    if (result.success) {
      setMessage({ type: "success", text: "Stock added successfully" });
      setRestockQuantities((prev) => ({ ...prev, [componentId]: 0 }));
      loadComponents();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to restock" });
    }
    setRestockingId(null);
  }

  async function handleQuickRestock(e: React.FormEvent) {
    e.preventDefault();
    const quantity = quickQuantity === "" ? 0 : Number(quickQuantity);
    if (!quickComponentId || quantity <= 0) return;

    setRestockingId(quickComponentId);
    setMessage(null);

    const result = await recordStockIn(
      quickComponentId,
      quantity,
      "Restock",
      getLoggedInUser() || undefined
    );

    if (result.success) {
      setMessage({ type: "success", text: "Stock added successfully" });
      setQuickComponentId("");
      setQuickQuantity("");
      loadComponents();
    } else {
      setMessage({ type: "error", text: result.error || "Failed to restock" });
    }
    setRestockingId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const lowStockComponents = components.filter(
    (c: any) => c.currentStock <= c.reorderThreshold
  );

  const selectedQuickComponent = components.find((c) => c.id === quickComponentId);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Restock</h1>
        <p className="text-gray-500 mt-1 text-sm">Quickly restock low inventory components</p>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
              : "bg-rose-50 border border-rose-200 text-rose-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Quick Restock Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Package size={18} className="text-emerald-500" />
          Quick Restock Entry
        </h2>
        <form onSubmit={handleQuickRestock} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Component *
            </label>
            <select
              value={quickComponentId}
              onChange={(e) => setQuickComponentId(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none transition-all text-sm"
            >
              <option value="">-- Select Component --</option>
              {components.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.currentStock} {c.unit} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Quantity to Add *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={quickQuantity}
              placeholder="e.g. 50"
              onChange={(e) => {
                const val = e.target.value;
                setQuickQuantity(val === "" ? "" : parseInt(val) || 0);
              }}
              required
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={restockingId !== null || !quickComponentId || (quickQuantity === "" ? 0 : Number(quickQuantity)) <= 0}
              className="w-full px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl disabled:opacity-50 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-500/10 active:scale-[0.995]"
            >
              {restockingId === quickComponentId ? "Adding..." : "Add Stock"}
            </button>
          </div>
        </form>
        {selectedQuickComponent && (quickQuantity === "" ? 0 : Number(quickQuantity)) > 0 && (
          <div className="mt-3 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 inline-block animate-fadeIn">
            Current: {selectedQuickComponent.currentStock} {selectedQuickComponent.unit} → New Stock: {selectedQuickComponent.currentStock + (quickQuantity === "" ? 0 : Number(quickQuantity))} {selectedQuickComponent.unit}
          </div>
        )}
      </div>

      {lowStockComponents.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-rose-500" />
            Low Stock Items
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-rose-50/50">
                  <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Component</th>
                  <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Category</th>
                  <th className="text-right py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Current Stock</th>
                  <th className="text-right py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Threshold</th>
                  <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Restock Quantity</th>
                  <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStockComponents.map((component: any) => (
                  <tr key={component.id} className="bg-rose-50/20 hover:bg-rose-50/40 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-gray-800">{component.name}</td>
                    <td className="py-3.5 px-5 text-gray-600">{component.category}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-rose-600">
                      {formatNumber(component.currentStock)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-gray-500">
                      {formatNumber(component.reorderThreshold)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={restockQuantities[component.id] || 0}
                        onChange={(e) =>
                          setRestockQuantities((prev) => ({
                            ...prev,
                            [component.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleRestock(component.id)}
                        disabled={restockingId === component.id || !restockQuantities[component.id] || restockQuantities[component.id] <= 0}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-xs font-semibold transition-colors"
                      >
                        {restockingId === component.id ? "..." : "Restock"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStockComponents.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-800">
          <p className="font-semibold">All components are well stocked ✓</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Package size={18} className="text-sky-500" />
          All Stock
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Component</th>
                <th className="text-left py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Category</th>
                <th className="text-right py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Current Stock</th>
                <th className="text-right py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Threshold</th>
                <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Restock Quantity</th>
                <th className="text-center py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {components.map((component: any) => {
                const isLow = component.currentStock <= component.reorderThreshold;
                return (
                  <tr key={component.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-gray-800">{component.name}</td>
                    <td className="py-3.5 px-5 text-gray-600">{component.category}</td>
                    <td className="py-3.5 px-5 text-right font-bold text-gray-800">
                      {formatNumber(component.currentStock)}
                    </td>
                    <td className="py-3.5 px-5 text-right text-gray-500">
                      {formatNumber(component.reorderThreshold)}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                          <AlertTriangle size={12} /> Low
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">OK</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={restockQuantities[component.id] || 0}
                        onChange={(e) =>
                          setRestockQuantities((prev) => ({
                            ...prev,
                            [component.id]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-center text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 outline-none"
                      />
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <button
                        onClick={() => handleRestock(component.id)}
                        disabled={restockingId === component.id || !restockQuantities[component.id] || restockQuantities[component.id] <= 0}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 text-xs font-semibold transition-colors"
                      >
                        {restockingId === component.id ? "..." : "Restock"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
