"use client";

import { useState } from "react";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { ComponentsList } from "../components/components/ComponentsList";
import { getComponents } from "@/app/actions/components";
import { generateCSV, downloadCSV } from "@/lib/csv";

export default function ComponentsPage() {
  const [showForm, setShowForm] = useState(false);

  async function handleExportCSV() {
    const result = await getComponents();
    if (result.success) {
      const headers = ["Name", "Category", "Unit", "Current Stock", "Reorder Threshold"];
      const rows = result.data.map((c) => [
        c.name,
        c.category,
        c.unit,
        c.currentStock,
        c.reorderThreshold,
      ]);
      const csv = generateCSV(headers, rows as any);
      downloadCSV(csv, `components-${new Date().toISOString().split("T")[0]}.csv`);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Components</h1>
          <p className="text-slate-600 mt-1">Manage your inventory components</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            <Download size={18} />
            Export CSV
          </button>
          <Link
            href="/components/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Component
          </Link>
        </div>
      </div>

      <ComponentsList />
    </div>
  );
}
