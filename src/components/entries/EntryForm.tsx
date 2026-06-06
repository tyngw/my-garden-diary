"use client";

import { useEffect, useMemo, useState } from "react";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { compressImage } from "@/lib/imageCompression";
import { EntryImagePicker } from "@/components/entries/EntryImagePicker";
import { ImageEditor } from "@/components/entries/ImageEditor";
import { PlantTypeSheet } from "@/components/entries/PlantTypeSheet";
import { bindTap } from "@/lib/tap";
import type { CompressionSettings, DiaryEntry, PlantType } from "@/lib/types";

type Props = {
  initial: Partial<DiaryEntry>;
  plantTypes: PlantType[];
  settings: CompressionSettings;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  submitLabel: string;
};

type EditingImage = { src: string; type: "existing" | "new"; index: number };

export function EntryForm({ initial, plantTypes, settings, onSubmit, submitLabel }: Props) {
  const [localPlantTypes, setLocalPlantTypes] = useState<PlantType[] | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [date, setDate] = useState(initial.date ?? "");
  const [memo, setMemo] = useState(initial.memo ?? "");
  const [plantTypeId, setPlantTypeId] = useState(initial.plantTypeId ?? "");
  const [existingImageUrls, setExistingImageUrls] = useState(initial.imageUrls ?? []);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [editingImage, setEditingImage] = useState<EditingImage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const remain = useMemo(() => 200 - memo.length, [memo]);
  const mergedPlantTypes = localPlantTypes ?? plantTypes;

  useEffect(() => {
    if (plantTypeId) return;
    const uncategorized = mergedPlantTypes.find((item) => item.name === "未分類" && !item.archived);
    if (uncategorized) setPlantTypeId(uncategorized.id);
  }, [mergedPlantTypes, plantTypeId]);

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
    if (!upload.ok || !uploaded.imageUrl) throw new Error(uploaded.error ?? "画像アップロードに失敗しました");
    return uploaded.imageUrl;
  };

  const submit = async (): Promise<void> => {
    setBusy(true);
    setError("");
    try {
      const uploadedImageUrls = await Promise.all(imageFiles.map(uploadImage));
      await onSubmit({ date, memo, plantTypeId: plantTypeId || null, imageUrls: [...existingImageUrls, ...uploadedImageUrls] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setBusy(false);
    }
  };

  const handleEditorSave = async (blob: Blob): Promise<void> => {
    const file = new File([blob], "edited.jpg", { type: "image/jpeg" });
    if (editingImage?.type === "existing") {
      setExistingImageUrls(urls => urls.filter((_, i) => i !== editingImage.index));
      setImageFiles(files => [...files, file]);
    } else if (editingImage?.type === "new") {
      setImageFiles(files => files.map((f, i) => i === editingImage.index ? file : f));
    }
    setEditingImage(null);
  };

  return (
    <>
      <button type="button" aria-label={submitLabel} title={submitLabel} {...bindTap(submit)}
        disabled={busy || !date}
        className="fixed right-2 top-[calc(env(safe-area-inset-top)+0.4rem)] z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8 text-[#f3fff7] backdrop-blur-sm disabled:opacity-45 sm:right-[max(0.75rem,calc((100vw-640px)/2+0.75rem))]">
        <CheckIcon className="h-5 w-5" />
      </button>
      <section className="space-y-4 rounded-3xl bg-[#1b6a4b] p-4 text-[#f3fff7]">
        <label className="block"><p className="mb-1 text-sm text-[#daf3e1]">日付</p><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="ios-safe-field ios-safe-field--compact w-full rounded-lg bg-[#f7fff9] px-3 text-[#1f4d35]" /></label>
        <label className="block">
          <p className="mb-1 text-sm text-[#daf3e1]">植物の種類</p>
          <div className="flex items-center gap-2">
            <select value={plantTypeId} onChange={(e) => setPlantTypeId(e.target.value)} className="ios-safe-field ios-safe-field--compact min-w-0 flex-1 rounded-lg bg-[#f7fff9] px-3 text-[#1f4d35]"><option value="">未選択</option>{mergedPlantTypes.filter((p) => !p.archived).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            <button type="button" aria-label="植物の種類を編集" {...bindTap(() => setSheetOpen(true))} className="app-btn-secondary inline-flex h-11 w-11 items-center justify-center p-0"><PencilSquareIcon className="h-5 w-5" /></button>
          </div>
        </label>
        <label className="block"><p className="mb-1 text-sm text-[#daf3e1]">メモ（200字以内）</p><textarea value={memo} onChange={(e) => setMemo(e.target.value.slice(0, 200))} rows={4} className="ios-safe-field w-full rounded-lg bg-[#f7fff9] px-3 py-2 text-[#1f4d35]" /><p className="mt-1 text-right text-xs text-[#daf3e1]">残り{remain}文字</p></label>
        <EntryImagePicker
          existingUrls={existingImageUrls}
          newFiles={imageFiles}
          onFilesChange={setImageFiles}
          onRemoveExisting={(index) => setExistingImageUrls((items) => items.filter((_, i) => i !== index))}
          onRemoveNew={(index) => setImageFiles((items) => items.filter((_, i) => i !== index))}
          onEditExisting={(index) => setEditingImage({ src: existingImageUrls[index], type: "existing", index })}
          onEditNew={(index, src) => setEditingImage({ src, type: "new", index })}
        />
        {error ? <p className="text-sm text-[#ffd6d6]">{error}</p> : null}
      </section>
      <PlantTypeSheet open={sheetOpen} plantTypes={mergedPlantTypes} onClose={() => setSheetOpen(false)} onUpdated={reloadPlantTypes} />
      {editingImage ? (
        <ImageEditor imageSrc={editingImage.src} onSave={handleEditorSave} onClose={() => setEditingImage(null)} />
      ) : null}
    </>
  );
}
