"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  imageUrl: string;
  onClose: () => void;
};

export function ImagePreviewModal({ imageUrl, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTapTime, setLastTapTime] = useState(0);
  const lastTouchDistance = useRef(0);

  // ピンチズーム処理
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) {
      return;
    }

    e.preventDefault();

    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const distance = Math.hypot(
      touch1.clientX - touch2.clientX,
      touch1.clientY - touch2.clientY
    );

    if (lastTouchDistance.current > 0) {
      const ratio = distance / lastTouchDistance.current;
      const newScale = Math.min(Math.max(scale * ratio, 1), 4);
      setScale(newScale);
    }

    lastTouchDistance.current = distance;
  }, [scale]);

  // ダブルタップ処理
  const handleImageTap = () => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      // ダブルタップ
      if (scale > 1.5) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
      setLastTapTime(0);
    } else {
      setLastTapTime(now);
    }
  };

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 && e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
    }
  };

  // ドラッグ中
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        return;
      }

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setTranslate({ x: deltaX, y: deltaY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragStart, translate]);

  // タッチイベント登録
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastTouchDistance.current = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const handleTouchEnd = () => {
      lastTouchDistance.current = 0;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="画像表示を閉じる"
        className="absolute right-4 top-4 z-20 rounded-full border border-white/30 bg-white/10 p-2 text-white"
        onPointerUp={(e) => {
          e.stopPropagation();
          if (e.pointerType !== "mouse") {
            e.preventDefault();
            onClose();
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <XMarkIcon className="h-6 w-6" />
      </button>

      <div
        className="relative h-full w-full max-h-[90vh] max-w-[90vw]"
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          transformOrigin: "center",
          transition: isDragging ? "none" : "transform 0.2s ease-out",
          cursor: scale > 1 ? "grab" : "default",
          userSelect: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleImageTap();
        }}
        onMouseDown={handleMouseDown}
      >
        <Image
          ref={imageRef}
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
