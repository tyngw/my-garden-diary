"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/layout/AppShell";
import { EntryListItem } from "@/components/entries/EntryListItem";
import { fetchAllEntries, fetchPlantTypes } from "@/lib/apiClient";
import type { DiaryEntry, PlantType } from "@/lib/types";

type DateGroup = {
  date: string;
  entries: DiaryEntry[];
};

export default function EntryDatePage() {
  const params = useParams<{ date: string }>();
  const [groups, setGroups] = useState<DateGroup[]>([]);
  const [openDate, setOpenDate] = useState("");
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);

  useEffect(() => {
    fetchAllEntries()
      .then((entries) => {
        const grouped = entries.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
          acc[entry.date] = [...(acc[entry.date] ?? []), entry];
          return acc;
        }, {});
        const nextGroups = Object.keys(grouped)
          .sort((a, b) => b.localeCompare(a))
          .map((date) => ({ date, entries: grouped[date] }));
        setGroups(nextGroups);
        setOpenDate(nextGroups[0]?.date ?? "");
      })
      .catch(() => {
        setGroups([]);
        setOpenDate("");
      });
    fetchPlantTypes(true).then(setPlantTypes).catch(() => setPlantTypes([]));
  }, [params.date]);

  return (
    <AppShell title="同日の記録一覧">
      <section className="space-y-3">
        {groups.map((group) => {
          const expanded = openDate === group.date;
          return (
            <section key={group.date} className="app-card overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenDate((current) => (current === group.date ? "" : group.date))}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                aria-expanded={expanded}
              >
                <div>
                  <p className="text-xs font-semibold tracking-wide text-[var(--ink-soft)]">DATE</p>
                  <p className="text-lg font-bold text-[var(--ink)]">{group.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {group.entries.length}件
                  </span>
                  <ChevronDownIcon className={`h-5 w-5 text-[var(--ink-soft)] transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
              </button>
              {expanded ? (
                <div className="space-y-3 px-3 pb-3">
                  {group.entries.map((entry) => (
                    <EntryListItem
                      key={entry.id}
                      entry={entry}
                      plantType={plantTypes.find((item) => item.id === entry.plantTypeId)}
                    />
                  ))}
                </div>
              ) : null}
            </section>
          );
        })}
      </section>
    </AppShell>
  );
}
