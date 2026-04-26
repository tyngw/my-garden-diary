"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EntryForm } from "@/components/entries/EntryForm";
import { fetchPlantTypes } from "@/lib/apiClient";
import { useCompressionSettings } from "@/hooks/useCompressionSettings";
import type { DiaryEntry, PlantType } from "@/lib/types";

export default function EditEntryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [settings] = useCompressionSettings();

  useEffect(() => {
    const id = params.id;
    if (!id) {
      return;
    }
    (async () => {
      const res = await fetch(`/api/entries/${id}`);
      const json = (await res.json()) as { entry?: DiaryEntry };
      if (json.entry) {
        setEntry(json.entry);
      }
    })().catch(() => setEntry(null));
    fetchPlantTypes().then(setPlantTypes).catch(() => setPlantTypes([]));
  }, [params.id]);

  if (!entry) {
    return (
      <AppShell title="編集">
        <section className="app-card p-4 text-sm text-[var(--ink-soft)]">読み込み中...</section>
      </AppShell>
    );
  }

  return (
    <AppShell title="記録編集">
      <EntryForm
        initial={entry}
        plantTypes={plantTypes}
        settings={settings}
        submitLabel="更新する"
        onSubmit={async (payload) => {
          const id = entry.id;
          const res = await fetch(`/api/entries/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = (await res.json()) as { error?: string };
          if (!res.ok) {
            throw new Error(json.error ?? "更新に失敗しました");
          }
          router.push(`/entries/${id}`);
        }}
      />
    </AppShell>
  );
}
