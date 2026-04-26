"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  existingUrls: string[];
  newFiles: File[];
  onFilesChange: (files: File[]) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
};

export function EntryImagePicker({
  existingUrls,
  newFiles,
  onFilesChange,
  onRemoveExisting,
  onRemoveNew,
}: Props) {
  const previewUrls = useMemo(() => newFiles.map((file) => URL.createObjectURL(file)), [newFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[var(--ink-soft)]">画像</p>
        <p className="text-xs text-[var(--ink-soft)]">最大10枚まで</p>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#bcd0c5] bg-[#f7faf7] px-3 py-3 text-[var(--ink)]">
        <PhotoIcon className="h-5 w-5" />
        <span className="text-sm font-semibold">画像を追加する</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            onFilesChange([...newFiles, ...files].slice(0, 10));
            event.currentTarget.value = "";
          }}
        />
      </label>
      {existingUrls.length || previewUrls.length ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {existingUrls.map((url, index) => (
            <div key={url} className="relative overflow-hidden rounded-xl border border-[#d8e6df] bg-white">
              <Image src={url} alt="existing" width={160} height={160} className="aspect-square h-full w-full object-cover" />
              <button
                type="button"
                aria-label="既存画像を削除"
                onClick={() => onRemoveExisting(index)}
                className="absolute right-1 top-1 rounded-full bg-black/45 p-1 text-white"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          {previewUrls.map((url, index) => (
            <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-[#d8e6df] bg-white">
              <Image src={url} alt="preview" width={160} height={160} unoptimized className="aspect-square h-full w-full object-cover" />
              <button
                type="button"
                aria-label="追加画像を削除"
                onClick={() => onRemoveNew(index)}
                className="absolute right-1 top-1 rounded-full bg-black/45 p-1 text-white"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
