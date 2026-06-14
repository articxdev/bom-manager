"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTransactionHistory, reverseTransaction } from "@/app/actions/history";
import { generateCSV, downloadCSV } from "@/lib/csv";
import { formatDate, formatNumber } from "@/lib/format";
import { Download, Undo } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    loadTransactions();
  }, [page]);

  async function loadTransactions() {
    setLoading(true);
    const result = await getTransactionHistory(10, (page - 1) * 10);
    if (result.success && result.data) {
      setTransactions(result.data.transactions);
      setTotal(result.data.total);
      setPages(result.data.pages);
    }
    setLoading(false);
  }

  async function handleReverse(txId: string) {
    const result = await reverseTransaction(txId);
    if (result.success) {
      loadTransactions();
    } else {
      alert("Error: " + result.error);
    }
  }

  async function handleExportCSV() {
    const headers = [
      "Date",
      "Component",
      "Type",
      "Quantity Change",
      "Resulting Balance",
      "Note",
    ];
    const rows = transactions.map((tx) => [
      formatDate(tx.createdAt),
      tx.component.name,
      tx.type,
      tx.quantityChange,
      tx.resultingBalance,
      tx.note || "",
    ]);
    const csv = generateCSV(headers, rows as any);
    downloadCSV(csv, `transactions-${new Date().toISOString().split("T")[0]}.csv`);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-slate-600">No transactions yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Component</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Change</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Balance</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Note</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-600">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {tx.component.name}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "STOCK_IN"
                            ? "bg-green-100 text-green-800"
                            : tx.type === "PRODUCTION"
                              ? "bg-blue-100 text-blue-800"
                              : tx.type === "DAMAGE"
                                ? "bg-red-100 text-red-800"
                                : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={
                          tx.quantityChange > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {tx.quantityChange > 0 ? "+" : ""}
                        {formatNumber(tx.quantityChange)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">
                      {formatNumber(tx.resultingBalance)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs max-w-xs truncate">
                      {tx.note}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {!tx.reversedTransactionId && tx.type !== "REVERSAL" && (
                        <button
                          onClick={() => handleReverse(tx.id)}
                          className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                        >
                          <Undo size={14} />
                          Reverse
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {pages}
              </span>
              <button
                onClick={() => setPage(Math.min(pages, page + 1))}
                disabled={page === pages}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:bg-slate-100"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
