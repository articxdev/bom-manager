"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, use } from "react";
import { getComponent } from "@/app/actions/components";
import { ComponentForm } from "@/app/components/forms/ComponentForm";
import { StockAdjustmentForm } from "@/app/components/forms/StockAdjustmentForm";
import { formatDate, formatNumber } from "@/lib/format";
import { useState as useStdState } from "react";
import { AlertTriangle } from "lucide-react";

export default function ComponentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAdjustment, setShowAdjustment] = useState(false);

  useEffect(() => {
    loadComponent();
  }, []);

  async function loadComponent() {
    const result = await getComponent(id);
    if (result.success) {
      setComponent(result.data);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!component) {
    return <div className="p-6 text-red-600">Component not found</div>;
  }

  const isLowStock = component.currentStock <= component.reorderThreshold;

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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{component.name}</h1>
                <p className="text-slate-600 mt-1">{component.category}</p>
              </div>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            </div>

            {editMode ? (
              <ComponentForm
                component={component}
                onClose={() => {
                  setEditMode(false);
                  loadComponent();
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Unit</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {component.unit}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Created</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    {formatDate(component.createdAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Stock Section */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Stock Information</h2>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className={`p-4 rounded-lg ${isLowStock ? "bg-red-50" : "bg-green-50"}`}>
                <p className="text-sm font-medium text-slate-700">Current Stock</p>
                <p className={`text-2xl font-bold mt-1 ${isLowStock ? "text-red-600" : "text-green-600"}`}>
                  {formatNumber(component.currentStock)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50">
                <p className="text-sm font-medium text-slate-700">Reorder Threshold</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {formatNumber(component.reorderThreshold)}
                </p>
              </div>
            </div>

            {isLowStock && (
              <div className="bg-red-50 border border-red-200 rounded p-4 mb-6 flex gap-3">
                <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Low Stock Alert</p>
                  <p className="text-sm text-red-800 mt-1">
                    Stock level is below the reorder threshold
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowAdjustment(!showAdjustment)}
              className="px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300"
            >
              {showAdjustment ? "Cancel" : "Adjust Stock"}
            </button>

            {showAdjustment && (
              <div className="mt-6 p-4 border border-slate-200 rounded-lg">
                <StockAdjustmentForm
                  componentId={id}
                  componentName={component.name}
                  currentStock={component.currentStock}
                  onClose={() => {
                    setShowAdjustment(false);
                    loadComponent();
                  }}
                />
              </div>
            )}
          </div>

          {/* Used In Products */}
          {component.bomItems.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Used In Products</h2>
              <div className="space-y-2">
                {component.bomItems.map((item: any) => (
                  <div key={item.id} className="p-3 border border-slate-200 rounded">
                    <p className="font-medium text-slate-900">{item.product.name}</p>
                    <p className="text-sm text-slate-600">
                      Qty: {formatNumber(item.quantityPerUnit)} per unit
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
            {component.transactions.length > 0 ? (
              <div className="space-y-3">
                {component.transactions.map((tx: any) => (
                  <div key={tx.id} className="border-l-2 border-blue-500 pl-3 py-2">
                    <p className="text-xs font-medium text-slate-700 uppercase">{tx.type}</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">
                      {tx.quantityChange > 0 ? "+" : ""}
                      {formatNumber(tx.quantityChange)}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 text-sm">No transactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
