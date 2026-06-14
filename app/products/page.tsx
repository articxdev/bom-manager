"use client";

import { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import Link from "next/link";
import { getProducts } from "@/app/actions/products";
import { generateCSV, downloadCSV } from "@/lib/csv";
import { formatDate, formatNumber } from "@/lib/format";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, [search]);

  async function loadProducts() {
    setLoading(true);
    const result = await getProducts(search || undefined);
    if (result.success) {
      setProducts(result.data);
    }
    setLoading(false);
  }

  async function handleExportCSV() {
    const headers = ["Name", "Description", "Components", "Created"];
    const rows = products.map((p) => [
      p.name,
      p.description || "",
      p.bomItems.length,
      p.createdAt,
    ]);
    const csv = generateCSV(headers, rows as any);
    downloadCSV(csv, `products-${new Date().toISOString().split("T")[0]}.csv`);
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600 mt-1">Manage products and BOMs</p>
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
            href="/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            New Product
          </Link>
        </div>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border border-slate-300 rounded-lg"
      />

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600 mb-4">No products found</p>
          <Link href="/products/new" className="text-blue-600 hover:underline">
            Create first product →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
              {product.description && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                  {product.description}
                </p>
              )}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">
                  Components: <span className="font-semibold text-slate-900">{product.bomItems.length}</span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Created: {formatDate(product.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
