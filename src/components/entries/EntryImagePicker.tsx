"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrls = useMemo(() => newFiles.map((file) => URL.createObjectURL(file)), [newFiles]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--ink-soft)]">画像</p>
          <p className="text-xs text-[var(--ink-soft)]">最大10枚まで</p>
        </div>
        <button
          type="button"
          aria-label="画像を追加"
          className="app-btn inline-flex h-10 w-10 items-center justify-center p-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>
      <input
        ref={fileInputRef}
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
      {!existingUrls.length && !previewUrls.length ? <p className="text-xs text-[var(--ink-soft)]">画像はまだ選択されていません</p> : null}
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
