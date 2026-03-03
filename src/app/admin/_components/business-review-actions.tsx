"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BusinessReviewActions({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function updateStatus(status: "APPROVED" | "REJECTED") {
    setLoading(status);

    const response = await fetch(`/api/admin/businesses/${businessId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setLoading(null);

    if (response.ok) {
      router.refresh();
    }
  }

  return (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => updateStatus("APPROVED")}
        className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-medium text-emerald-950 disabled:opacity-50"
      >
        {loading === "APPROVED" ? "Approving..." : "Approve"}
      </button>
      <button
        type="button"
        disabled={loading !== null}
        onClick={() => updateStatus("REJECTED")}
        className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium text-rose-950 disabled:opacity-50"
      >
        {loading === "REJECTED" ? "Rejecting..." : "Reject"}
      </button>
    </div>
  );
}
