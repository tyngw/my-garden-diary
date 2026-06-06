"use client";

import { useEffect, useRef } from "react";
import { MARKER_LINE_WIDTH, type Point } from "@/lib/shapeRecognition";

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  colorRef: React.RefObject<string>;
  onStrokeEnd: (points: Point[]) => void;
};

export function useDrawingCanvas({ canvasRef, colorRef, onStrokeEnd }: Props) {
  const onStrokeEndRef = useRef(onStrokeEnd);
  useEffect(() => { onStrokeEndRef.current = onStrokeEnd; });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e: PointerEvent): Point => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (canvas.width / r.width),
        y: (e.clientY - r.top) * (canvas.height / r.height),
      };
    };

    const pts: Point[] = [];

    const drawLiveSegment = (p: Point) => {
      if (pts.length < 2) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const prev = pts[pts.length - 2];
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth = MARKER_LINE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      pts.length = 0;
      pts.push(getPos(e));
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!canvas.hasPointerCapture(e.pointerId)) return;
      e.preventDefault();
      const p = getPos(e);
      pts.push(p);
      drawLiveSegment(p);
    };

    const finish = (e: PointerEvent) => {
      if (!canvas.hasPointerCapture(e.pointerId)) return;
      onStrokeEndRef.current([...pts]);
      pts.length = 0;
    };

    canvas.addEventListener("pointerdown", onDown, { passive: false });
    canvas.addEventListener("pointermove", onMove, { passive: false });
    canvas.addEventListener("pointerup", finish);
    canvas.addEventListener("pointercancel", finish);

    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", finish);
      canvas.removeEventListener("pointercancel", finish);
    };
  }, [canvasRef, colorRef]);
}
