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
  const [quantityInput, setQuantityInput] = useState<string | number>("");
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
    const quantity = quantityInput === "" ? 0 : Number(quantityInput);

    if (!selectedComponentId || quantity <= 0 || !note) {
      setError("All fields are required and quantity must be greater than 0");
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
  const numericQuantity = quantityInput === "" ? 0 : Number(quantityInput);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Record Damage/Loss</h1>
        <p className="text-gray-500 mt-1 text-sm">Report damaged or lost inventory items</p>
      </div>

      <div className="max-w-lg bg-white rounded-3xl border border-gray-200/60 shadow-sm p-6 sm:p-8 space-y-5">
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-rose-700 text-xs font-semibold animate-fadeIn">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Component *
          </label>
          <select
            value={selectedComponentId}
            onChange={(e) => {
              setSelectedComponentId(e.target.value);
              setConfirm(false);
            }}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm cursor-pointer"
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
          <div className="bg-violet-50/50 border border-violet-100/50 rounded-2xl p-4 text-xs sm:text-sm text-slate-800">
            Current Stock: <span className="text-violet-600 font-bold">{component.currentStock}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Quantity Damaged *
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
            placeholder="Enter quantity"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
            Reason/Note *
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all outline-none text-sm"
            rows={3}
            placeholder="Describe the damage"
          />
        </div>

        {component && numericQuantity > 0 && numericQuantity > component.currentStock && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-700 text-xs sm:text-sm">
            <label className="flex items-center gap-2 font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={confirm}
                onChange={(e) => setConfirm(e.target.checked)}
                className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              Confirm negative stock
            </label>
          </div>
        )}

        <button
          onClick={handleDamage}
          disabled={loading || !selectedComponentId || numericQuantity <= 0 || !note}
          className="w-full px-4 py-3.5 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 disabled:opacity-50 font-bold text-xs sm:text-sm shadow-md shadow-rose-600/10 transition-all active:scale-[0.995]"
        >
          {loading ? "Processing..." : "Record Damage"}
        </button>
      </div>
    </div>
  );
}
