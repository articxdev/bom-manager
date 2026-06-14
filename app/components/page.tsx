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
    if (result.success && result.data) {
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Components</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage your inventory components</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <Link
            href="/components/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 text-sm font-medium shadow-sm shadow-violet-600/20 transition-colors"
          >
            <Plus size={16} />
            Add Component
          </Link>
        </div>
      </div>

      <ComponentsList />
    </div>
  );
}
