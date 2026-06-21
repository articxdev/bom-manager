"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProduct } from "@/app/actions/products";
import { recordProduction } from "@/app/actions/transactions";
import { formatNumber } from "@/lib/format";
import { getLoggedInUser } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

export default function ProductionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  
  // Use state variables that support empty strings for editing comfort
  const [quantityInput, setQuantityInput] = useState<string | number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [insufficientItems, setInsufficientItems] = useState<any[]>([]);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const result = await fetch("/api/products").then((r) => r.json());
    if (result.success) {
      setProducts(result.data);
    }
  }

  async function loadProductPreview(productId: string, qty: number) {
    const result = await getProduct(productId);
    if (result.success && result.data) {
      const product = result.data;
      setPreview(
        product.bomItems.map((item: any) => ({
          component: item.component.name,
          unit: item.component.unit,
          perUnit: item.quantityPerUnit,
          needed: item.quantityPerUnit * qty,
          current: item.component.currentStock,
          sufficient:
            item.component.currentStock >= item.quantityPerUnit * qty,
        }))
      );
    }
  }

  async function handleProduction() {
    const quantity = quantityInput === "" ? 1 : Number(quantityInput);

    if (!selectedProductId || quantity < 1) {
      setError("Please select a product and enter a quantity of at least 1");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await recordProduction(
      selectedProductId,
      quantity,
      insufficientItems.length > 0,
      getLoggedInUser() || undefined
    );

    if (result.success) {
      router.push("/history");
    } else {
      if ("insufficientItems" in result && result.insufficientItems) {
        setInsufficientItems(result.insufficientItems);
      }
      setError(result.error || "Failed to record production");
    }

    setLoading(false);
  }

  useEffect(() => {
    if (selectedProductId) {
      const qty = quantityInput === "" ? 1 : Number(quantityInput);
      loadProductPreview(selectedProductId, qty);
    } else {
      setPreview(null);
    }
  }, [selectedProductId, quantityInput]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Production Entry</h1>
        <p className="text-gray-500 mt-1 text-sm">Log manufactured products and automatically deduct BOM items</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 sm:p-8 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 text-xs font-semibold animate-fadeIn">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setInsufficientItems([]);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm cursor-pointer"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Units to Produce *
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
                placeholder="1"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
              />
            </div>

            {insufficientItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> Insufficient Stock Alert
                </p>
                <div className="space-y-1 text-xs text-amber-700">
                  {insufficientItems.map((item) => (
                    <p key={item.componentName}>
                      {item.componentName}: only {formatNumber(item.current)} available, need{" "}
                      {formatNumber(item.needed)}
                    </p>
                  ))}
                </div>
                <label className="flex items-center gap-2 pt-1 font-semibold text-amber-800 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInsufficientItems([]);
                      }
                    }}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Force production anyway</span>
                </label>
              </div>
            )}

            <button
              onClick={handleProduction}
              disabled={loading || !selectedProductId}
              className="w-full px-4 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl hover:brightness-105 disabled:opacity-50 font-bold text-xs sm:text-sm shadow-md shadow-violet-500/10 transition-all active:scale-[0.995]"
            >
              {loading ? "Processing..." : "Record Production"}
            </button>
          </div>
        </div>

        {/* Preview Container */}
        {preview && (
          <div className="lg:col-span-2 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">BOM Component Preview</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-150 bg-gray-50/50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Component</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Per Unit</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Total Needed</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Current Stock</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-gray-800">{item.component}</td>
                        <td className="py-3 px-4 text-center text-gray-600">{formatNumber(item.perUnit)}</td>
                        <td className="py-3 px-4 text-center font-bold text-rose-600">
                          -{formatNumber(item.needed)}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-500">{formatNumber(item.current)}</td>
                        <td className="py-3 px-4 text-center">
                          {item.sufficient ? (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Sufficient</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              <AlertTriangle size={10} /> Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
