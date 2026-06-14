"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordDamage } from "@/app/actions/transactions";
import { getComponents } from "@/app/actions/components";

export default function DamagePage() {
  const router = useRouter();
  const [components, setComponents] = useState<any[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    loadComponents();
  }, []);

  async function loadComponents() {
    const result = await getComponents();
    if (result.success) {
      setComponents(result.data);
    }
  }

  async function handleDamage() {
    if (!selectedComponentId || quantity <= 0 || !note) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await recordDamage(
      selectedComponentId,
      quantity,
      note,
      confirm
    );

    if (result.success) {
      router.push("/history");
    } else {
      setError(result.error);
    }

    setLoading(false);
  }

  const component = components.find((c) => c.id === selectedComponentId);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Record Damage/Loss</h1>

      <div className="max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Component *
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => {
              setSelectedComponentId(e.target.value);
              setConfirm(false);
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          >
            <option value="">-- Select Component --</option>
            {components.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {component && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
            <p>Current Stock: {component.currentStock}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Quantity Damaged *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reason/Note *
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            rows={3}
            placeholder="Describe the damage"
          />
        </div>

        {component && quantity > 0 && quantity > component.currentStock && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="rounded"
              />
              Confirm negative stock
            </label>
          </div>
        )}

        <button
          onClick={handleDamage}
          disabled={loading || !selectedComponentId || quantity <= 0 || !note}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-slate-400"
        >
          {loading ? "Processing..." : "Record Damage"}
        </button>
      </div>
    </div>
  );
}
