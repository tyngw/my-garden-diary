"use client";

import { useState } from "react";
import { ArchiveBoxIcon, CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { bindTap } from "@/lib/tap";
import type { PlantType } from "@/lib/types";

type Props = {
  open: boolean;
  plantTypes: PlantType[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
};

export function PlantTypeSheet({ open, plantTypes, onClose, onUpdated }: Props) {
  const [newName, setNewName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  if (!open) {
    return null;
  }

  const save = async (id: string): Promise<void> => {
    const name = (names[id] ?? plantTypes.find((item) => item.id === id)?.name ?? "").trim();
    if (!name) {
      return;
    }
    setSavingId(id);
    try {
      await fetch(`/api/plant-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      await onUpdated();
    } finally {
      setSavingId(null);
    }
  };

  const archive = async (id: string): Promise<void> => {
    setArchivingId(id);
    try {
      await fetch(`/api/plant-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      await onUpdated();
    } finally {
      setArchivingId(null);
    }
  };

  const add = async (): Promise<void> => {
    if (!newName.trim()) {
      return;
    }
    await fetch("/api/plant-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName("");
    await onUpdated();
  };

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="閉じる" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" {...bindTap(onClose)} />
      <section className="relative mx-auto flex h-dvh w-full max-w-[860px] flex-col bg-[var(--surface)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[var(--ink)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">植物の種類を管理</h3>
            <p className="text-sm text-[var(--ink-soft)]">追加、名称変更、アーカイブをここで管理できます。</p>
          </div>
          <button type="button" aria-label="閉じる" className="rounded-full p-1 hover:bg-[var(--surface-soft)]" {...bindTap(onClose)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-white/5 p-3">
          <div className="mb-3 flex gap-2">
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="種類を追加"
              className="app-input ios-safe-field ios-safe-field--compact flex-1"
            />
            <button type="button" aria-label="追加" title="追加" className="app-btn inline-flex h-11 w-11 items-center justify-center p-0" {...bindTap(add)}>
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="min-h-0 space-y-3 overflow-y-auto overscroll-contain pr-1">
          {plantTypes.map((item) => (
            <div key={item.id} className="app-panel flex items-center gap-2 p-2">
              <input
                value={names[item.id] ?? item.name}
                onChange={(event) => setNames((prev) => ({ ...prev, [item.id]: event.target.value }))}
                className="app-input ios-safe-field ios-safe-field--compact flex-1"
                disabled={item.archived}
              />
              {item.archived ? (
                <span className="rounded-md bg-[var(--surface-soft)] px-2 py-1 text-xs text-[var(--ink-soft)]">archived</span>
              ) : null}
              <button
                type="button"
                aria-label="保存"
                title="保存"
                disabled={item.archived || savingId === item.id}
                className="app-btn inline-flex h-11 w-11 items-center justify-center p-0 disabled:opacity-50"
                {...bindTap(() => save(item.id))}
              >
                <CheckIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="アーカイブ"
                title="アーカイブ"
                disabled={item.id === "default-plant" || item.archived || archivingId === item.id}
                className="app-btn-secondary inline-flex h-11 w-11 items-center justify-center p-0 disabled:opacity-50"
                {...bindTap(() => archive(item.id))}
              >
                <ArchiveBoxIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}
