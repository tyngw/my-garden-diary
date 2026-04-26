"use client";

import { useMemo, useState } from "react";
import { compressImage } from "@/lib/imageCompression";
import { EntryImagePicker } from "@/components/entries/EntryImagePicker";
import { PlantTypeSheet } from "@/components/entries/PlantTypeSheet";
import type { CompressionSettings, DiaryEntry, PlantType } from "@/lib/types";
import type { TouchEvent } from "react";

function tap(handler: () => void) {
  return {
    onTouchEnd(e: TouchEvent) {
      e.preventDefault();
      handler();
    },
    onClick: handler,
  };
}

type Props = {
  initial: Partial<DiaryEntry>;
  plantTypes: PlantType[];
  settings: CompressionSettings;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
};

export function EntryForm({ initial, plantTypes, settings, onSubmit, submitLabel }: Props) {
  const [localPlantTypes, setLocalPlantTypes] = useState<PlantType[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [date, setDate] = useState(initial.date ?? "");
  const [memo, setMemo] = useState(initial.memo ?? "");
  const [plantTypeId, setPlantTypeId] = useState(initial.plantTypeId ?? "");
  const [existingImageUrls, setExistingImageUrls] = useState(initial.imageUrls ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remain = useMemo(() => 200 - memo.length, [memo]);
  const mergedPlantTypes = localPlantTypes ?? plantTypes;

  const reloadPlantTypes = async (): Promise<void> => {
    const response = await fetch("/api/plant-types?archived=true");
    const json = (await response.json()) as { plantTypes: PlantType[] };
    setLocalPlantTypes(json.plantTypes);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const blob = await compressImage(file, settings);
    const form = new FormData();
    form.set("file", new File([blob], "entry.jpg", { type: "image/jpeg" }));
    const upload = await fetch("/api/upload", { method: "POST", body: form });
    const uploaded = (await upload.json()) as { imageUrl?: string; error?: string };
    if (!upload.ok || !uploaded.imageUrl) {
      throw new Error(uploaded.error ?? "画像アップロードに失敗しました");
    }
    return uploaded.imageUrl;
  };

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError("");
    try {
      const uploadedImageUrls = await Promise.all(imageFiles.map(uploadImage));
      await onSubmit({
        date,
        memo,
        plantTypeId: plantTypeId || null,
        imageUrls: [...existingImageUrls, ...uploadedImageUrls],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="space-y-4 rounded-3xl bg-[#1b6a4b] p-4 text-[#f3fff7]">
        <label className="block"><p className="mb-1 text-sm text-[#daf3e1]">日付</p><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ios-safe-field ios-safe-field--compact w-full rounded-lg bg-[#f7fff9] px-3 text-[#1f4d35]" /></label>
        <label className="block"><p className="mb-1 text-sm text-[#daf3e1]">植物の種類</p><select value={plantTypeId} onChange={(e) => setPlantTypeId(e.target.value)} className="ios-safe-field ios-safe-field--compact w-full rounded-lg bg-[#f7fff9] px-3 text-[#1f4d35]"><option value="">未選択</option>{mergedPlantTypes.filter((p) => !p.archived).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <button type="button" {...tap(() => setSheetOpen(true))} className="touch-manipulation min-h-11 w-full rounded-lg bg-[#3f9269] px-3 py-2 text-sm font-semibold text-[#f3fff7]">種類を追加・編集する</button>
        <label className="block"><p className="mb-1 text-sm text-[#daf3e1]">メモ（200字以内）</p><textarea value={memo} onChange={(e) => setMemo(e.target.value.slice(0, 200))} rows={4} className="ios-safe-field w-full rounded-lg bg-[#f7fff9] px-3 py-2 text-[#1f4d35]" /><p className="mt-1 text-right text-xs text-[#daf3e1]">残り{remain}文字</p></label>
        <EntryImagePicker
          existingUrls={existingImageUrls}
          newFiles={imageFiles}
          onFilesChange={setImageFiles}
          onRemoveExisting={(index) => setExistingImageUrls((items) => items.filter((_, itemIndex) => itemIndex !== index))}
          onRemoveNew={(index) => setImageFiles((items) => items.filter((_, itemIndex) => itemIndex !== index))}
        />
        {error ? <p className="text-sm text-[#ffd6d6]">{error}</p> : null}
        <button type="button" {...tap(submit)} disabled={busy || !date} className="w-full rounded-xl bg-[#4cae68] px-4 py-3 font-semibold text-[#f3fff7] disabled:opacity-50">{busy ? "保存中..." : submitLabel}</button>
      </section>
      <PlantTypeSheet
        open={sheetOpen}
        plantTypes={mergedPlantTypes}
        onClose={() => setSheetOpen(false)}
        onUpdated={reloadPlantTypes}
      />
    </>
  );
}
