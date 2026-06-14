"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recordDamage } from "@/app/actions/transactions";
import { getComponents } from "@/app/actions/components";
import { getLoggedInUser } from "@/lib/auth";

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
    if (result.success && result.data) {
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
      confirm,
      getLoggedInUser() || undefined
    );

    if (result.success) {
      router.push("/history");
    } else {
      setError(result.error || "An error occurred");
    }

    setLoading(false);
  }

  const component = components.find((c) => c.id === selectedComponentId);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Record Damage/Loss</h1>
        <p className="text-gray-500 mt-1 text-sm">Report damaged or lost inventory items</p>
      </div>

      <div className="max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Component *
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => {
              setSelectedComponentId(e.target.value);
              setConfirm(false);
            }}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
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
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sm text-sky-700 font-medium">
            Current Stock: <span className="font-bold">{component.currentStock}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Quantity Damaged *
          </label>
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Reason/Note *
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 outline-none transition-all text-sm"
            rows={3}
            placeholder="Describe the damage"
          />
        </div>

        {component && quantity > 0 && quantity > component.currentStock && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
            <label className="flex items-center gap-2 font-medium">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              Confirm negative stock
            </label>
          </div>
        )}

        <button
          onClick={handleDamage}
          disabled={loading || !selectedComponentId || quantity <= 0 || !note}
          className="w-full px-4 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:bg-gray-300 disabled:text-gray-500 font-semibold text-sm shadow-sm shadow-rose-600/20 transition-colors"
        >
          {loading ? "Processing..." : "Record Damage"}
        </button>
      </div>
    </div>
  );
}
