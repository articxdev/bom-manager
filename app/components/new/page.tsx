"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ComponentForm } from "@/app/components/forms/ComponentForm";

export default function NewComponentPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-slate-900">Add New Component</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-md">
        <ComponentForm
          onClose={() => router.push("/components")}
        />
      </div>
    </div>
  );
}
