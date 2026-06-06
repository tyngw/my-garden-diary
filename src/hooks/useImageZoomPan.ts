"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useImageZoomPan(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const lastDist = useRef(0);
  const lastTapTime = useRef(0);
  const scaleRef = useRef(scale);
  const translateRef = useRef(translate);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { translateRef.current = translate; }, [translate]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    const [t1, t2] = [e.touches[0], e.touches[1]];
    const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
    if (lastDist.current > 0) {
      setScale(s => Math.min(Math.max(s * dist / lastDist.current, 1), 4));
    }
    lastDist.current = dist;
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      lastDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    };
    const onEnd = () => { lastDist.current = 0; };
    el.addEventListener("touchstart", onStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [containerRef, handleTouchMove]);

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => {
      setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const onUp = () => setIsDragging(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, dragStart]);

  const onTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (scaleRef.current > 1.5) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
      lastTapTime.current = 0;
    } else {
      lastTapTime.current = now;
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scaleRef.current > 1 && e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - translateRef.current.x, y: e.clientY - translateRef.current.y });
    }
  }, []);

  return { scale, translate, isDragging, onTap, handleMouseDown };
}
