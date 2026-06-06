"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PencilSquareIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/layout/AppShell";
import { ImagePreviewModal } from "@/components/entries/ImagePreviewModal";
import { ImageEditor } from "@/components/entries/ImageEditor";
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
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [relatedEntries, setRelatedEntries] = useState<DiaryEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const id = params.id;
    if (!id) return;
    (async () => {
      const res = await fetch(`/api/entries/${id}`);
      const json = (await res.json()) as { entry?: DiaryEntry };
      if (json.entry) {
        setEntry(json.entry);
        if (json.entry.plantTypeId) {
          const relatedRes = await fetch(`/api/entries?plantTypeId=${encodeURIComponent(json.entry.plantTypeId)}&limit=1000`);
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

  const handleEditorSave = async (blob: Blob): Promise<void> => {
    if (!entry || !editingImageUrl) return;
    const form = new FormData();
    form.set("file", new File([blob], "edited.jpg", { type: "image/jpeg" }));
    const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
    const { imageUrl: newUrl } = (await uploadRes.json()) as { imageUrl: string };
    const imageUrls = entry.imageUrls.map(u => u === editingImageUrl ? newUrl : u);
    const updateRes = await fetch(`/api/entries/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...entry, imageUrls }),
    });
    const { entry: updated } = (await updateRes.json()) as { entry?: DiaryEntry };
    if (updated) setEntry(updated);
    setEditingImageUrl(null);
  };

  const plantName = plantTypes.find((p) => p.id === entry?.plantTypeId)?.name ?? "未分類";
  const from = searchParams.get("from");
  const backHref = from && from.startsWith("/entries/date/") ? from : "/calendar";

  return (
    <AppShell title="記録詳細" backHref={backHref}>
      <section className="app-card space-y-3 p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-1">
            <button type="button" aria-label="前の記録" title="前の記録"
              disabled={currentIndex >= relatedEntries.length - 1}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-soft)] disabled:opacity-40"
              {...bindTap(() => {
                const i = currentIndex + 1;
                if (i < relatedEntries.length) router.push(`/entries/${relatedEntries[i].id}`);
              })}>
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <p className="text-center text-sm font-semibold text-[var(--ink-soft)]">{entry?.date}</p>
            <button type="button" aria-label="次の記録" title="次の記録"
              disabled={currentIndex <= 0}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-soft)] disabled:opacity-40"
              {...bindTap(() => {
                const i = currentIndex - 1;
                if (i >= 0) router.push(`/entries/${relatedEntries[i].id}`);
              })}>
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-[var(--ink)]">{plantName}</p>
            {entry ? (
              <div className="flex items-center gap-2">
                <Link href={`/entries/${entry.id}/edit`} aria-label="編集する" title="編集する"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-soft)]">
                  <PencilSquareIcon className="h-5 w-5" />
                </Link>
                <button type="button" aria-label="削除する" title="削除する" disabled={deleting}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#dd8b8b] bg-[#fff3f3] text-[#b04242] disabled:opacity-50"
                  {...bindTap(async () => {
                    if (!window.confirm("この記録を削除しますか？")) return;
                    setDeleting(true);
                    try {
                      const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
                      const json = (await res.json()) as { error?: string };
                      if (!res.ok) throw new Error(json.error ?? "削除に失敗しました");
                      router.push("/calendar");
                    } catch (error) {
                      window.alert(error instanceof Error ? error.message : "削除に失敗しました");
                    } finally { setDeleting(false); }
                  })}>
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
        {entry?.imageUrls.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {entry.imageUrls.map((imageUrl, index) => (
              <button key={imageUrl} type="button" className="touch-manipulation"
                {...bindTap(() => setSelectedImage(imageUrl))}>
                <Image src={imageUrl} alt={`記録画像 ${index + 1}`} width={640} height={480}
                  className="h-auto w-full rounded-2xl border border-[#d6e5dc] object-cover" />
              </button>
            ))}
          </div>
        ) : null}
        <p className="app-panel min-h-24 whitespace-pre-wrap p-3 text-[var(--ink)]">{entry?.memo || "メモはありません"}</p>
      </section>
      {selectedImage ? (
        <ImagePreviewModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
          onEdit={() => { setEditingImageUrl(selectedImage); setSelectedImage(null); }}
        />
      ) : null}
      {editingImageUrl ? (
        <ImageEditor imageSrc={editingImageUrl} onSave={handleEditorSave} onClose={() => setEditingImageUrl(null)} />
      ) : null}
    </AppShell>
  );
}
