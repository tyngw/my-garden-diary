"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EntryListItem } from "@/components/entries/EntryListItem";
import { fetchEntriesByDate, fetchPlantTypes } from "@/lib/apiClient";
import type { DiaryEntry, PlantType } from "@/lib/types";

export default function EntryDatePage() {
  const params = useParams<{ date: string }>();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [date, setDate] = useState("");

  useEffect(() => {
    const value = params.date;
    if (!value) {
      return;
    }
    setDate(value);
    fetchEntriesByDate(value).then(setEntries).catch(console.error);
    fetchPlantTypes(true).then(setPlantTypes).catch(console.error);
  }, [params.date]);

  return (
    <AppShell title="同日の記録一覧">
      <section className="app-card mb-3 p-3">
        <p className="text-xs font-semibold tracking-wide text-[var(--ink-soft)]">DATE</p>
        <p className="text-lg font-bold text-[var(--ink)]">{date}</p>
      </section>
      <section className="space-y-3">
        {entries.map((entry) => (
          <EntryListItem
            key={entry.id}
            entry={entry}
            plantType={plantTypes.find((item) => item.id === entry.plantTypeId)}
          />
        ))}
      </section>
    </AppShell>
  );
}
