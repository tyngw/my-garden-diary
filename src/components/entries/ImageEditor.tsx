"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { XMarkIcon, ArrowPathIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";
import { useDrawingCanvas } from "@/hooks/useDrawingCanvas";
import { recognizeShape, MARKER_LINE_WIDTH, type Point, type RecognizedShape } from "@/lib/shapeRecognition";

type DrawnShape = RecognizedShape & { color: string };

const COLORS = [
  { label: "赤", value: "#ef4444" },
  { label: "青", value: "#3b82f6" },
  { label: "黄", value: "#eab308" },
  { label: "黒", value: "#111111" },
  { label: "白", value: "#ffffff" },
];

function drawShape(ctx: CanvasRenderingContext2D, shape: DrawnShape) {
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = MARKER_LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  if (shape.type === "line") {
    ctx.moveTo(shape.x1, shape.y1);
    ctx.lineTo(shape.x2, shape.y2);
  } else {
    ctx.arc(shape.cx, shape.cy, shape.r, 0, 2 * Math.PI);
  }
  ctx.stroke();
}

type Props = { imageSrc: string; onSave: (blob: Blob) => Promise<void>; onClose: () => void };

export function ImageEditor({ imageSrc, onSave, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const strokesRef = useRef<DrawnShape[]>([]);
  const redoStackRef = useRef<DrawnShape[]>([]);
  const colorRef = useRef(COLORS[0].value);
  const [strokes, setStrokes] = useState<DrawnShape[]>([]);
  const [redoStack, setRedoStack] = useState<DrawnShape[]>([]);
  const [color, setColor] = useState(COLORS[0].value);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(imageSrc);

  useEffect(() => { strokesRef.current = strokes; }, [strokes]);
  useEffect(() => { redoStackRef.current = redoStack; }, [redoStack]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = baseImgRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const s of strokesRef.current) drawShape(ctx, s);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      baseImgRef.current = img;
      const canvas = canvasRef.current;
      if (canvas) { canvas.width = img.naturalWidth; canvas.height = img.naturalHeight; }
      redraw();
    };
    img.src = currentSrc;
  }, [currentSrc, redraw]);

  useEffect(() => { redraw(); }, [strokes, redraw]);

  const handleStrokeEnd = useCallback((pts: Point[]) => {
    if (pts.length < 2) return;
    setStrokes(prev => [...prev, { ...recognizeShape(pts), color: colorRef.current }]);
    setRedoStack([]);
  }, []);

  useDrawingCanvas({ canvasRef, colorRef, onStrokeEnd: handleStrokeEnd });

  const handleUndo = useCallback(() => {
    if (!strokesRef.current.length) return;
    const last = strokesRef.current[strokesRef.current.length - 1];
    setStrokes(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, last]);
  }, []);

  const handleRedo = useCallback(() => {
    if (!redoStackRef.current.length) return;
    const last = redoStackRef.current[redoStackRef.current.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, last]);
  }, []);

  const handleRotate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const off = document.createElement("canvas");
    off.width = canvas.height;
    off.height = canvas.width;
    const ctx = off.getContext("2d")!;
    ctx.translate(off.width, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(canvas, 0, 0);
    setCurrentSrc(off.toDataURL("image/jpeg", 0.9));
    setStrokes([]);
    setRedoStack([]);
  }, []);

  const handleSave = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(b => b ? resolve(b) : reject(new Error("生成失敗")), "image/jpeg", 0.85)
      );
      await onSave(blob);
    } finally { setSaving(false); }
  }, [onSave]);

  const selectColor = (value: string) => {
    colorRef.current = value;
    setColor(value);
    setColorPickerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" aria-label="キャンセル" onClick={onClose}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
          <XMarkIcon className="h-6 w-6" />
        </button>
        <button type="button" aria-label="保存" disabled={saving} onClick={handleSave}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2d7a4f] text-white disabled:opacity-50">
          <CheckIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-2"
        onPointerDown={() => setColorPickerOpen(false)}>
        <canvas ref={canvasRef} className="touch-none block" style={{ maxWidth: "100%", maxHeight: "100%" }} />
      </div>

      {colorPickerOpen ? (
        <div className="flex justify-end gap-2 px-5 pb-2">
          {COLORS.map(c => (
            <button key={c.value} type="button" aria-label={c.label} onClick={() => selectColor(c.value)}
              className="h-9 w-9 rounded-full border-[3px] transition-transform active:scale-110"
              style={{
                backgroundColor: c.value,
                borderColor: color === c.value ? "#fff" : "rgba(255,255,255,0.3)",
                boxShadow: c.value === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.3)" : "none",
              }} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <button type="button" aria-label="90度回転" onClick={handleRotate}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <button type="button" aria-label="元に戻す" onClick={handleUndo} disabled={!strokes.length}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30">
            <ArrowUturnLeftIcon className="h-5 w-5" />
          </button>
          <button type="button" aria-label="やり直す" onClick={handleRedo} disabled={!redoStack.length}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-30">
            <ArrowUturnRightIcon className="h-5 w-5" />
          </button>
        </div>
        <button type="button" aria-label="色を選択" onClick={() => setColorPickerOpen(v => !v)}
          className="h-11 w-11 rounded-full border-[3px] border-white/70 transition-transform active:scale-110"
          style={{
            backgroundColor: color,
            boxShadow: color === "#ffffff" ? "inset 0 0 0 1px rgba(0,0,0,0.3)" : "none",
          }} />
      </div>
    </div>
  );
}
