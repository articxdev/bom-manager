"use client";

import { useEffect, useState, use } from "react";
import { getProduct, calculateProductionCapacity } from "@/app/actions/products";
import { formatDate, formatNumber } from "@/lib/format";
import { useRouter, useParams } from "next/navigation";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [capacityQuery, setCapacityQuery] = useState(1);
  const [capacity, setCapacity] = useState<any>(null);

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {
    const result = await getProduct(id);
    if (result.success) {
      setProduct(result.data);
    }
    setLoading(false);
  }

  async function checkCapacity() {
    const result = await calculateProductionCapacity(id, capacityQuery);
    if (result.success) {
      setCapacity(result.data);
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (!product) return <div className="p-6 text-red-600">Product not found</div>;

  return (
    <div className="p-6">
      <button
        onClick={() => router.back()}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
            {product.description && (
              <p className="text-slate-600 mt-2">{product.description}</p>
            )}
            <p className="text-xs text-slate-500 mt-4">
              Created: {formatDate(product.createdAt)}
            </p>
          </div>

          {/* BOM Table */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Bill of Materials ({product.bomItems.length} components)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-2 px-3 font-semibold text-slate-700">
                      Component
                    </th>
                    <th className="text-center py-2 px-3 font-semibold text-slate-700">
                      Per Unit
                    </th>
                    <th className="text-right py-2 px-3 font-semibold text-slate-700">
                      Current Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.bomItems.map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-2 px-3 font-medium text-slate-900">
                        {item.component.name}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {formatNumber(item.quantityPerUnit)} {item.component.unit}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-600">
                        {formatNumber(item.component.currentStock)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Production Capacity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              Production Capacity
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Check capacity for:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={capacityQuery}
                    onChange={(e) => setCapacityQuery(parseInt(e.target.value) || 1)}
                    className="flex-1 px-2 py-1 border border-slate-300 rounded text-sm"
                  />
                  <button
                    onClick={checkCapacity}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Check
                  </button>
                </div>
              </div>

              {capacity && (
                <div
                  className={`p-3 rounded border ${
                    capacity.canProduce
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {capacity.canProduce ? (
                      <span className="text-green-900">✓ Can produce {capacityQuery} units</span>
                    ) : (
                      <span className="text-red-900">✗ Cannot produce {capacityQuery} units</span>
                    )}
                  </p>

                  {capacity.limitingComponents.length > 0 && (
                    <div className="mt-3 space-y-1 text-xs">
                      <p className="font-semibold text-slate-700">Insufficient:</p>
                      {capacity.limitingComponents.map((item: any) => (
                        <p key={item.componentName} className="text-slate-600">
                          {item.componentName}: {formatNumber(item.available)} available, need{" "}
                          {formatNumber(item.needed)}
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 mt-2">
                    Max units: {capacity.maxUnits}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
