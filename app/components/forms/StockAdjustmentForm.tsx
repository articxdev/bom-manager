"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustComponentStock } from "@/app/actions/components";
import { manualAdjustmentSchema } from "@/lib/schemas";
import { getLoggedInUser } from "@/lib/auth";

interface StockAdjustmentFormProps {
  componentId: string;
  componentName: string;
  currentStock: number;
  onClose?: () => void;
}

export function StockAdjustmentForm({
  componentId,
  componentName,
  currentStock,
  onClose,
}: StockAdjustmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use state variables that support empty strings for editing comfort
  const [quantityInput, setQuantityInput] = useState<string | number>("");
  const [note, setNote] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        quantityChange: quantityInput === "" ? 0 : Number(quantityInput),
        note,
      };

      const validated = manualAdjustmentSchema.parse(payload);
      const result = await adjustComponentStock(
        componentId,
        validated,
        getLoggedInUser() || undefined
      );

      if (result.success) {
        router.refresh();
        onClose?.();
      } else {
        setError(result.error || "An error occurred");
      }
    } catch (err: any) {
      setError(err.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  }

  const numericQuantity = quantityInput === "" ? 0 : Number(quantityInput);
  const newStock = currentStock + numericQuantity;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 text-xs font-semibold animate-fadeIn">
          {error}
        </div>
      )}

      <div className="bg-violet-50/50 border border-violet-100/50 rounded-2xl p-4 text-slate-800 text-xs sm:text-sm">
        <p className="font-bold text-slate-900">{componentName}</p>
        <p className="mt-1 text-slate-500 font-medium">Current Stock: <span className="text-violet-600 font-semibold">{currentStock}</span></p>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Quantity Change (+ or -) *
        </label>
        <input
          type="number"
          step="1"
          required
          value={quantityInput}
          onChange={(e) => {
            const val = e.target.value;
            // Allow typing negative/positive signs
            setQuantityInput(val === "" ? "" : parseInt(val) || 0);
          }}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          placeholder="e.g., 50 or -10"
        />
      </div>

      {newStock < 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 text-rose-700 text-xs font-semibold">
          ⚠️ Warning: This will result in negative stock ({newStock})
        </div>
      )}

      {quantityInput !== "" && newStock >= 0 && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3.5 text-emerald-700 text-xs font-semibold">
          ✓ New stock will be: {newStock}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Reason/Note *
        </label>
        <textarea
          required
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          rows={3}
          placeholder="Why is this adjustment being made?"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || newStock < 0}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl hover:brightness-105 disabled:opacity-50 text-sm font-semibold transition-all shadow-md shadow-violet-500/10"
        >
          {loading ? "Adjusting..." : "Confirm Adjustment"}
        </button>
      </div>
    </form>
  );
}
