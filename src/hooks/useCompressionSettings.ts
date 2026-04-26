"use client";

import { useState } from "react";
import { defaultCompression } from "@/lib/imageCompression";
import type { CompressionSettings } from "@/lib/types";

const KEY = "my-garden-diary-compression";

function readStoredSettings(): CompressionSettings {
  if (typeof window === "undefined") {
    return defaultCompression;
  }
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return defaultCompression;
  }
  try {
    return JSON.parse(raw) as CompressionSettings;
  } catch {
    localStorage.removeItem(KEY);
    return defaultCompression;
  }
}

export function useCompressionSettings(): [
  CompressionSettings,
  (next: CompressionSettings) => void,
] {
  const [settings, setSettings] = useState<CompressionSettings>(readStoredSettings);

  const update = (next: CompressionSettings): void => {
    setSettings(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  return [settings, update];
}
