"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/layout/AppShell";
import { fetchPlantTypes } from "@/lib/apiClient";
import type { DiaryEntry, PlantType } from "@/lib/types";

export default function EntryDetailPage() {
  const params = useParams<{ id: string }>();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);

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
    fetchPlantTypes(true).then(setPlantTypes).catch(() => setPlantTypes([]));
  }, [params.id]);

  const plantName = plantTypes.find((p) => p.id === entry?.plantTypeId)?.name ?? "未分類";

  return (
    <AppShell title="記録詳細">
      <section className="app-card space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--ink-soft)]">{entry?.date}</p>
            <p className="text-lg font-bold text-[var(--ink)]">{plantName}</p>
          </div>
          <span className="rounded-lg bg-[#fff2e4] px-2.5 py-1 text-xs font-semibold text-[#c0681f]">DETAIL</span>
        </div>
        {entry?.imageUrls.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {entry.imageUrls.map((imageUrl, index) => (
              <Image key={imageUrl} src={imageUrl} alt={`記録画像 ${index + 1}`} width={640} height={480} className="h-auto w-full rounded-2xl border border-[#d6e5dc] object-cover" />
            ))}
          </div>
        ) : null}
        <p className="app-panel min-h-24 whitespace-pre-wrap p-3 text-[var(--ink)]">{entry?.memo || "メモはありません"}</p>
        {entry ? (
          <Link href={`/entries/${entry.id}/edit`} className="app-btn inline-flex items-center gap-1 px-4 py-2">
            <PencilSquareIcon className="h-5 w-5" />編集する
          </Link>
        ) : null}
      </section>
    </AppShell>
  );
}
