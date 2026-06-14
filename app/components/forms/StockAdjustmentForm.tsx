"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adjustComponentStock } from "@/app/actions/components";
import { manualAdjustmentSchema, ManualAdjustmentInput } from "@/lib/schemas";

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
  const [formData, setFormData] = useState<ManualAdjustmentInput>({
    quantityChange: 0,
    note: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validated = manualAdjustmentSchema.parse(formData);
      const result = await adjustComponentStock(componentId, validated);

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

  const newStock = currentStock + formData.quantityChange;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-blue-800 text-sm">
        <p className="font-medium">{componentName}</p>
        <p className="mt-1">Current Stock: {currentStock}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Quantity Change (+ or -) *
        </label>
        <input
          type="number"
          required
          step="0.01"
          value={formData.quantityChange}
          onChange={(e) =>
            setFormData({
              ...formData,
              quantityChange: parseFloat(e.target.value) || 0,
            })
          }
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., +50 or -10"
        />
      </div>

      {newStock < 0 && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
          ⚠️ Warning: This will result in negative stock ({newStock})
        </div>
      )}

      {newStock >= 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-3 text-green-800 text-sm">
          ✓ New stock will be: {newStock}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reason/Note *
        </label>
        <textarea
          required
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Why is this adjustment being made?"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || newStock < 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
        >
          {loading ? "Adjusting..." : "Confirm Adjustment"}
        </button>
      </div>
    </form>
  );
}
