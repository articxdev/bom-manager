"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordStockIn } from "@/app/actions/transactions";
import { getComponents } from "@/app/actions/components";
import { getLoggedInUser } from "@/lib/auth";

export default function StockInPage() {
  const router = useRouter();
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComponents();
  }, []);

  async function loadComponents() {
    const result = await getComponents();
    if (result.success && result.data) {
      setComponents(result.data);
    }
  }

  async function handleStockIn() {
    if (!selectedComponentId || quantity <= 0) {
      setError("Please select component and enter quantity");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await recordStockIn(
      selectedComponentId,
      quantity,
      note || undefined,
      getLoggedInUser() || undefined
    );

    if (result.success) {
      router.push("/history");
    } else {
      setError(result.error || "Failed to record stock in");
    }

    setLoading(false);
  }

  const component = components.find((c) => c.id === selectedComponentId);
  const newStock = component ? component.currentStock + quantity : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Receive Stock</h1>
        <p className="text-gray-500 mt-1 text-sm">Add incoming inventory to your stock</p>
      </div>

      <div className="max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Component *
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => setSelectedComponentId(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
          >
            <option value="">-- Select Component --</option>
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {component && (
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-700 font-medium">
            Current: <span className="font-bold">{component.currentStock}</span> → After: <span className="font-bold text-emerald-700">{newStock}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity Received *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
            rows={2}
            placeholder="e.g., Purchase order #1234"
          />
        </div>

        <button
          onClick={handleStockIn}
          disabled={loading || !selectedComponentId || quantity <= 0}
          className="w-full px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 font-semibold text-sm shadow-sm shadow-emerald-600/20 transition-colors"
        >
          {loading ? "Processing..." : "Confirm Stock In"}
        </button>
      </div>
    </div>
  );
}
