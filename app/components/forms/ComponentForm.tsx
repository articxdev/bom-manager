"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComponent, updateComponent } from "@/app/actions/components";
import { componentSchema } from "@/lib/schemas";
import { getLoggedInUser } from "@/lib/auth";

interface ComponentFormProps {
  component?: any;
  onClose?: () => void;
}

export function ComponentForm({ component, onClose }: ComponentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use string or number for inputs to allow empty state ("")
  const [formData, setFormData] = useState({
    name: component?.name || "",
    category: component?.category || "",
    unit: component?.unit || "pcs",
    currentStock: component !== undefined ? component.currentStock : "",
    reorderThreshold: component !== undefined ? component.reorderThreshold : "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Cast empty fields to 0 or numeric representation
      const payload = {
        ...formData,
        currentStock: formData.currentStock === "" ? 0 : Number(formData.currentStock),
        reorderThreshold: formData.reorderThreshold === "" ? 0 : Number(formData.reorderThreshold),
      };

      const validated = componentSchema.parse(payload);
      const user = getLoggedInUser() || undefined;
      const result = component
        ? await updateComponent(component.id, { ...validated, enteredBy: user })
        : await createComponent(validated, user);

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

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 text-xs font-semibold animate-fadeIn">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
          Component Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          placeholder="e.g., 10K Ohm Resistor"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Category *
          </label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
            placeholder="e.g., Electronics"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Unit *
          </label>
          <input
            type="text"
            required
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
            placeholder="e.g., pcs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Current Stock *
          </label>
          <input
            type="number"
            step="1"
            min="0"
            value={formData.currentStock}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({
                ...formData,
                currentStock: val === "" ? "" : parseInt(val) || 0,
              });
            }}
            placeholder="0"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Reorder Threshold *
          </label>
          <input
            type="number"
            step="1"
            min="0"
            value={formData.reorderThreshold}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({
                ...formData,
                reorderThreshold: val === "" ? "" : parseInt(val) || 0,
              });
            }}
            placeholder="0"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          />
        </div>
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
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl hover:brightness-105 disabled:opacity-50 text-sm font-semibold transition-all shadow-md shadow-violet-500/10"
        >
          {loading ? "Saving..." : component ? "Update Component" : "Create Component"}
        </button>
      </div>
    </form>
  );
}
