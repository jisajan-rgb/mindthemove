"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STORAGE_KEY = "mtm-bristol-conversation-shortlist";

const ITEMS = [
  {
    id: "regulator",
    label: "Ask for a live SRA or CLC number, and write it down.",
  },
  {
    id: "client-money",
    label: "Ask how client money is held before you instruct.",
  },
  {
    id: "timeline",
    label: "Ask what happens if searches or the other side run late.",
  },
  {
    id: "no-stars",
    label: "Ignore placeholder star ratings. Wait for reviews after completion.",
  },
] as const;

type ItemId = (typeof ITEMS)[number]["id"];

function loadTicked(): ItemId[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is ItemId =>
      ITEMS.some((item) => item.id === value),
    );
  } catch {
    return [];
  }
}

export function BuyerShortlist() {
  const [ticked, setTicked] = useState<ItemId[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTicked(loadTicked());
    setReady(true);
  }, []);

  function toggle(id: ItemId) {
    setTicked((current) => {
      const next = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-2xl">A shortlist for your conversation</CardTitle>
        <CardDescription>
          Tick these as you talk to a solicitor. They stay on this device only —
          we do not collect your name, email, or phone, and we do not match or
          sell introductions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {ITEMS.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 rounded border-input"
                  checked={ready && ticked.includes(item.id)}
                  onChange={() => toggle(item.id)}
                />
                <span>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
