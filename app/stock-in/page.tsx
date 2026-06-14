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
  const [quantityInput, setQuantityInput] = useState<string | number>("");
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
    const quantity = quantityInput === "" ? 0 : Number(quantityInput);

    if (!selectedComponentId || quantity <= 0) {
      setError("Please select component and enter quantity greater than 0");
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
  const numericQuantity = quantityInput === "" ? 0 : Number(quantityInput);
  const newStock = component ? component.currentStock + numericQuantity : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Receive Stock</h1>
        <p className="text-gray-500 mt-1 text-sm">Add incoming inventory to your stock</p>
      </div>

      <div className="max-w-lg bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 sm:p-8 space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 text-xs font-semibold animate-fadeIn">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Component *
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => setSelectedComponentId(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm cursor-pointer"
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
          <div className="bg-violet-50/50 border border-violet-100/50 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 font-medium">
            Current: <span className="font-bold text-slate-700">{component.currentStock}</span> → After: <span className="font-bold text-emerald-600">{newStock}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Quantity Received *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantityInput}
            onChange={(e) => {
              const val = e.target.value;
              setQuantityInput(val === "" ? "" : parseInt(val) || 0);
            }}
            placeholder="Enter quantity"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
            rows={2}
            placeholder="e.g., Purchase order #1234"
          />
        </div>

        <button
          onClick={handleStockIn}
          disabled={loading || !selectedComponentId || numericQuantity <= 0}
          className="w-full px-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl disabled:opacity-50 font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/10 transition-all active:scale-[0.995]"
        >
          {loading ? "Processing..." : "Confirm Stock In"}
        </button>
      </div>
    </div>
  );
}
