"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EntryForm } from "@/components/entries/EntryForm";
import { fetchPlantTypes } from "@/lib/apiClient";
import { getTodayJst } from "@/lib/date";
import { useCompressionSettings } from "@/hooks/useCompressionSettings";
import type { PlantType } from "@/lib/types";

export default function NewEntryPage() {
  const router = useRouter();
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [settings] = useCompressionSettings();
  const [initialDate, setInitialDate] = useState<string | null>(null);

  useEffect(() => {
    const dateFromQuery = new URLSearchParams(window.location.search).get("date");
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateFromQuery ?? "")) {
      setInitialDate(dateFromQuery as string);
    } else {
      setInitialDate(getTodayJst());
    }
    fetchPlantTypes(true).then(setPlantTypes).catch(() => setPlantTypes([]));
  }, []);

  return (
    <AppShell title="新規記録" backHref="/calendar">
      {initialDate ? (
        <EntryForm
          key={initialDate}
          initial={{ date: initialDate, memo: "" }}
          plantTypes={plantTypes}
          settings={settings}
          submitLabel="記録を保存"
          onSubmit={async (payload) => {
            const res = await fetch("/api/entries", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const json = (await res.json()) as { error?: string };
            if (!res.ok) {
              throw new Error(json.error ?? "保存できませんでした");
            }
            router.push("/calendar");
          }}
        />
      ) : (
        <section className="app-card p-4 text-sm text-[var(--ink-soft)]">読み込み中...</section>
      )}
    </AppShell>
  );
}
