"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/products";
import { getComponents } from "@/app/actions/components";
import { getLoggedInUser } from "@/lib/auth";
import { ChevronLeft } from "lucide-react";

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
    // Initialize quantityPerUnit as empty string to allow typing freely
    setBomItems([...bomItems, { componentId: "", quantityPerUnit: "" }]);
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

    // Map fields, converting empty quantity values to 1
    const formattedBOM = bomItems.map((b) => ({
      componentId: b.componentId,
      quantityPerUnit: b.quantityPerUnit === "" ? 1 : Number(b.quantityPerUnit),
    }));

    // Check if any component is not selected
    if (formattedBOM.some((b) => !b.componentId)) {
      setError("Please select a component for all BOM items");
      setLoading(false);
      return;
    }

    const result = await createProduct(
      { name, description },
      formattedBOM,
      getLoggedInUser() || undefined
    );

    if (result.success) {
      router.push("/products");
    } else {
      setError(result.error || "An error occurred");
    }

    setLoading(false);
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft size={16} />
        Back
      </button>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Create New Product</h1>
        <p className="text-gray-500 mt-1 text-sm">Design a new product assembly and compile its Bill of Materials</p>
      </div>

      <div className="max-w-2xl bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 text-xs font-semibold animate-fadeIn">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm"
              placeholder="e.g. Smart Hub Model-S"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm"
              rows={3}
              placeholder="Provide a brief description of the product"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Bill of Materials *
              </label>
              <button
                type="button"
                onClick={addBomItem}
                className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline cursor-pointer"
              >
                + Add Component
              </button>
            </div>

            {bomItems.length === 0 && (
              <p className="text-xs text-gray-400 italic text-center py-4">No components added yet. Click "+ Add Component" to build your BOM.</p>
            )}

            <div className="space-y-3">
              {bomItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-end bg-gray-50 border border-gray-100/50 p-4 rounded-2xl animate-fadeIn">
                  <div className="flex-1 space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
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
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-850 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none text-xs cursor-pointer"
                    >
                      <option value="">-- Select --</option>
                      {components.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24 space-y-1">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Qty/Unit
                    </label>
                    <input
                      type="number"
                      required
                      step="1"
                      min="1"
                      value={item.quantityPerUnit}
                      onChange={(e) => {
                        const newItems = [...bomItems];
                        const val = e.target.value;
                        newItems[idx].quantityPerUnit = val === "" ? "" : parseInt(val) || 0;
                        setBomItems(newItems);
                      }}
                      placeholder="1"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none text-xs text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeBomItem(idx)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl hover:brightness-105 disabled:opacity-50 text-sm font-semibold transition-all shadow-md shadow-violet-500/10"
            >
              {loading ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
