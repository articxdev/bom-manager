"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/products";
import { getComponents } from "@/app/actions/components";
import { useEffect } from "react";

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [bomItems, setBomItems] = useState<any[]>([]);
  const [components, setComponents] = useState<any[]>([]);
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

  function addBomItem() {
    setBomItems([...bomItems, { componentId: "", quantityPerUnit: 1 }]);
  }

  function removeBomItem(index: number) {
    setBomItems(bomItems.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || bomItems.length === 0) {
      setError("Name and at least one component required");
      setLoading(false);
      return;
    }

    const result = await createProduct(
      { name, description },
      bomItems.map((b) => ({ componentId: b.componentId, quantityPerUnit: b.quantityPerUnit }))
    );

    if (result.success) {
      router.push("/products");
    } else {
      setError(result.error || "An error occurred");
    }

    setLoading(false);
  }

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-slate-900 mb-8">Create New Product</h1>

      <div className="max-w-2xl bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              rows={3}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-slate-700">
                Bill of Materials *
              </label>
              <button
                type="button"
                onClick={addBomItem}
                className="text-blue-600 hover:underline text-sm font-medium"
              >
                + Add Component
              </button>
            </div>

            <div className="space-y-3">
              {bomItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 items-end border border-slate-200 p-3 rounded">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Component
                    </label>
                    <select
                      required
                      value={item.componentId}
                      onChange={(e) => {
                        const newItems = [...bomItems];
                        newItems[idx].componentId = e.target.value;
                        setBomItems(newItems);
                      }}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      <option value="">-- Select --</option>
                      {components.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Qty/Unit
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      value={item.quantityPerUnit}
                      onChange={(e) => {
                        const newItems = [...bomItems];
                        newItems[idx].quantityPerUnit = parseFloat(e.target.value);
                        setBomItems(newItems);
                      }}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBomItem(idx)}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
