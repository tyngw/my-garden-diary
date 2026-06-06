"use client";

import Image from "next/image";
import { useRef } from "react";
import { XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useImageZoomPan } from "@/hooks/useImageZoomPan";

type Props = {
  imageUrl: string;
  onClose: () => void;
  onEdit?: () => void;
};

export function ImagePreviewModal({ imageUrl, onClose, onEdit }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, translate, isDragging, onTap, handleMouseDown } = useImageZoomPan(containerRef);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="absolute right-4 top-4 z-20 flex gap-2">
        {onEdit ? (
          <button
            type="button"
            aria-label="画像を編集"
            className="rounded-full border border-white/30 bg-white/10 p-2 text-white"
            onPointerUp={(e) => {
              e.stopPropagation();
              if (e.pointerType !== "mouse") { e.preventDefault(); onEdit(); }
            }}
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <PencilSquareIcon className="h-6 w-6" />
          </button>
        ) : null}
        <button
          type="button"
          aria-label="画像表示を閉じる"
          className="rounded-full border border-white/30 bg-white/10 p-2 text-white"
          onPointerUp={(e) => {
            e.stopPropagation();
            if (e.pointerType !== "mouse") { e.preventDefault(); onClose(); }
          }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div
        className="relative h-full w-full max-h-[90vh] max-w-[90vw]"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.2s ease-out",
          cursor: scale > 1 ? "grab" : "default",
          userSelect: "none",
        }}
        onClick={(e) => { e.stopPropagation(); onTap(); }}
        onMouseDown={handleMouseDown}
      >
        <Image
          src={imageUrl}
          alt="全画面表示画像"
          fill
          className="object-contain pointer-events-none"
          sizes="90vw"
        />
      </div>
    </div>
  );
}
