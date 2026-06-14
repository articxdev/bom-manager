"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProduct } from "@/app/actions/products";
import { recordProduction } from "@/app/actions/transactions";
import { formatNumber } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

export default function ProductionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
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

  async function loadProductPreview(productId: string) {
    const result = await getProduct(productId);
    if (result.success) {
      const product = result.data;
      setPreview(
        product.bomItems.map((item: any) => ({
          component: item.component.name,
          unit: item.component.unit,
          perUnit: item.quantityPerUnit,
          needed: item.quantityPerUnit * quantity,
          current: item.component.currentStock,
          sufficient:
            item.component.currentStock >= item.quantityPerUnit * quantity,
        }))
      );
    }
  }

  async function handleProduction() {
    if (!selectedProductId || quantity < 1) {
      setError("Please select a product and enter a quantity");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await recordProduction(
      selectedProductId,
      quantity,
      insufficientItems.length > 0
    );

    if (result.success) {
      router.push("/history");
    } else {
      if ("insufficientItems" in result) {
        setInsufficientItems(result.insufficientItems);
      }
      setError(result.error);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (selectedProductId) {
      loadProductPreview(selectedProductId);
    }
  }, [selectedProductId, quantity]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Production Entry</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Product *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setInsufficientItems([]);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">-- Select Product --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Units to Produce *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            {insufficientItems.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm font-medium text-yellow-900 mb-2">⚠️ Warning:</p>
                <div className="space-y-1 text-xs text-yellow-800">
                  {insufficientItems.map((item) => (
                    <p key={item.componentName}>
                      {item.componentName}: only {formatNumber(item.current)} available, need{" "}
                      {formatNumber(item.needed)}
                    </p>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setInsufficientItems([]);
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-xs">Proceed anyway</span>
                </label>
              </div>
            )}

            <button
              onClick={handleProduction}
              disabled={loading || !selectedProductId}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400"
            >
              {loading ? "Processing..." : "Record Production"}
            </button>
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">BOM Preview</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-2">Component</th>
                      <th className="text-center py-2 px-2">Per Unit</th>
                      <th className="text-center py-2 px-2">Needed</th>
                      <th className="text-center py-2 px-2">Current</th>
                      <th className="text-center py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-2 px-2 font-medium">{item.component}</td>
                        <td className="py-2 px-2 text-center">{formatNumber(item.perUnit)}</td>
                        <td className="py-2 px-2 text-center font-semibold">
                          -{formatNumber(item.needed)}
                        </td>
                        <td className="py-2 px-2 text-center">{formatNumber(item.current)}</td>
                        <td className="py-2 px-2 text-center">
                          {item.sufficient ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600 flex items-center justify-center gap-1">
                              <AlertTriangle size={14} />
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
