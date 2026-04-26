"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PencilSquareIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/layout/AppShell";
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
          </div>
        ) : null}
      </section>
      {selectedImage ? (
        <div className="fixed inset-0 z-50 bg-black/90 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="画像表示を閉じる"
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/10 p-2 text-white"
            {...bindTap(() => setSelectedImage(null))}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
          <button type="button" className="h-full w-full" {...bindTap(() => setSelectedImage(null))}>
            <div className="relative h-full w-full">
              <Image src={selectedImage} alt="全画面表示画像" fill className="object-contain" sizes="100vw" />
            </div>
          </button>
        </div>
      ) : null}
    </AppShell>
  );
}
