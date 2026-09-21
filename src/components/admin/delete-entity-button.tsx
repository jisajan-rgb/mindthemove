"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DeleteEntityButton({
  path,
  label,
}: {
  path: string;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!window.confirm(`Delete this ${label}?`)) return;
    setLoading(true);
    try {
      const response = await fetch(path, { method: "DELETE" });
      if (!response.ok) {
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="destructive" size="sm" disabled={loading} onClick={() => void onDelete()}>
      Delete
    </Button>
  );
}
