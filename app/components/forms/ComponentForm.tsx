"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComponent, updateComponent } from "@/app/actions/components";
import { componentSchema, ComponentInput } from "@/lib/schemas";
import { X } from "lucide-react";

interface ComponentFormProps {
  component?: any;
  onClose?: () => void;
}

export function ComponentForm({ component, onClose }: ComponentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ComponentInput>({
    name: component?.name || "",
    category: component?.category || "",
    unit: component?.unit || "pcs",
    currentStock: component?.currentStock || 0,
    reorderThreshold: component?.reorderThreshold || 0,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validated = componentSchema.parse(formData);
      const result = component
        ? await updateComponent(component.id, validated)
        : await createComponent(validated);

      if (result.success) {
        router.refresh();
        onClose?.();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Validation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Component Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., 10K Ohm Resistor"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Electronics"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Unit *
          </label>
          <input
            type="text"
            required
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="pcs, meter, gram, etc"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Current Stock *
          </label>
          <input
            type="number"
            required
            step="0.01"
            value={formData.currentStock}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentStock: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Reorder Threshold *
          </label>
          <input
            type="number"
            required
            step="0.01"
            value={formData.reorderThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorderThreshold: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
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
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
        >
          {loading ? "Saving..." : component ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
}
