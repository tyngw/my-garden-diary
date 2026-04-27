"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/layout/AppShell";
import { ImagePreviewModal } from "@/components/entries/ImagePreviewModal";
import { fetchPlantTypes } from "@/lib/apiClient";
import { bindTap } from "@/lib/tap";
import type { DiaryEntry, PlantType } from "@/lib/types";

export default function EntryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [relatedEntries, setRelatedEntries] = useState<DiaryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

        // 同じ植物の記録をすべて取得
        if (json.entry.plantTypeId) {
          const relatedRes = await fetch(
            `/api/entries?plantTypeId=${encodeURIComponent(json.entry.plantTypeId)}&limit=1000`
          );
          const relatedJson = (await relatedRes.json()) as { entries?: DiaryEntry[] };
          if (relatedJson.entries) {
            const sorted = relatedJson.entries.sort((a, b) => b.date.localeCompare(a.date));
            setRelatedEntries(sorted);
            const idx = sorted.findIndex((e) => e.id === id);
            setCurrentIndex(idx >= 0 ? idx : 0);
          }
        }
      }
    })().catch(() => setEntry(null));
    fetchPlantTypes(true).then(setPlantTypes).catch(() => setPlantTypes([]));
  }, [params.id]);

  const plantName = plantTypes.find((p) => p.id === entry?.plantTypeId)?.name ?? "未分類";
  const from = searchParams.get("from");
  const backHref = from && from.startsWith("/entries/date/") ? from : "/calendar";

  return (
    <AppShell title="記録詳細" backHref={backHref}>
      <section className="app-card space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-[var(--ink-soft)]">{entry?.date}</p>
            <p className="text-lg font-bold text-[var(--ink)]">{plantName}</p>
          </div>
        </div>
        {entry?.imageUrls.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {entry.imageUrls.map((imageUrl, index) => (
              <button
                key={imageUrl}
                type="button"
                className="touch-manipulation"
                {...bindTap(() => setSelectedImage(imageUrl))}
              >
                <Image src={imageUrl} alt={`記録画像 ${index + 1}`} width={640} height={480} className="h-auto w-full rounded-2xl border border-[#d6e5dc] object-cover" />
              </button>
            ))}
          </div>
        ) : null}
        <p className="app-panel min-h-24 whitespace-pre-wrap p-3 text-[var(--ink)]">{entry?.memo || "メモはありません"}</p>
        {entry ? (
          <div className="flex flex-wrap gap-2">
            <Link href={`/entries/${entry.id}/edit`} className="app-btn inline-flex items-center gap-1 px-4 py-2">
              <PencilSquareIcon className="h-5 w-5" />編集する
            </Link>
            <button
              type="button"
              disabled={deleting}
              className="inline-flex items-center gap-1 rounded-xl border border-[#dd8b8b] bg-[#fff3f3] px-4 py-2 text-sm font-semibold text-[#b04242] disabled:opacity-50"
              {...bindTap(async () => {
                if (!window.confirm("この記録を削除しますか？")) {
                  return;
                }
                setDeleting(true);
                try {
                  const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
                  const json = (await res.json()) as { error?: string };
                  if (!res.ok) {
                    throw new Error(json.error ?? "削除に失敗しました");
                  }
                  router.push("/calendar");
                } catch (error) {
                  window.alert(error instanceof Error ? error.message : "削除に失敗しました");
                } finally {
                  setDeleting(false);
                }
              })}
            >
              <TrashIcon className="h-5 w-5" />削除
            </button>
            {relatedEntries.length > 1 && (
              <>
                <button
                  type="button"
                  disabled={currentIndex >= relatedEntries.length - 1}
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] disabled:opacity-50"
                  {...bindTap(() => {
                    const prevIndex = currentIndex + 1;
                    if (prevIndex < relatedEntries.length) {
                      router.push(`/entries/${relatedEntries[prevIndex].id}`);
                    }
                  })}
                >
                  <ChevronLeftIcon className="h-5 w-5" />前の記録
                </button>
                <button
                  type="button"
                  disabled={currentIndex <= 0}
                  className="inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] disabled:opacity-50"
                  {...bindTap(() => {
                    const nextIndex = currentIndex - 1;
                    if (nextIndex >= 0) {
                      router.push(`/entries/${relatedEntries[nextIndex].id}`);
                    }
                  })}
                >
                  次の記録<ChevronRightIcon className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        ) : null}
      </section>
      {selectedImage ? (
        <ImagePreviewModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      ) : null}
    </AppShell>
  );
}
