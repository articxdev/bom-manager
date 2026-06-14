"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordStockIn } from "@/app/actions/transactions";
import { getComponents } from "@/app/actions/components";

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

    const result = await recordStockIn(selectedComponentId, quantity, note || undefined);

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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Receive Stock</h1>

      <div className="max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Component *
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => setSelectedComponentId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
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
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p>Current: {component.currentStock} → After: {newStock}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quantity Received *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows={2}
            placeholder="e.g., Purchase order #1234"
          />
        </div>

        <button
          onClick={handleStockIn}
          disabled={loading || !selectedComponentId || quantity <= 0}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400"
        >
          {loading ? "Processing..." : "Confirm Stock In"}
        </button>
      </div>
    </div>
  );
}
