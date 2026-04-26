"use client";

import { useState } from "react";
import { ArchiveBoxIcon, CheckIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]" onClick={onClose}>
      <section
        className="absolute bottom-0 left-0 right-0 mx-auto max-w-[860px] rounded-t-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-[var(--ink)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">植物の種類を管理</h3>
            <p className="text-sm text-[var(--ink-soft)]">追加、名称変更、アーカイブをここで管理できます。</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-[var(--surface-soft)]">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-3 flex gap-2">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="種類を追加"
            className="app-input ios-safe-field ios-safe-field--compact flex-1"
          />
          <button type="button" onClick={add} className="app-btn inline-flex items-center justify-center gap-1.5 px-3 py-2">
            <PlusIcon className="h-4 w-4" />
            <span>追加</span>
          </button>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
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
                onClick={() => save(item.id)}
                disabled={item.archived || savingId === item.id}
                className="app-btn inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs disabled:opacity-50"
              >
                <CheckIcon className="h-4 w-4" />
                <span>保存</span>
              </button>
              <button
                type="button"
                onClick={() => archive(item.id)}
                disabled={item.id === "default-plant" || item.archived || archivingId === item.id}
                className="app-btn-secondary inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs disabled:opacity-50"
              >
                <ArchiveBoxIcon className="h-4 w-4" />
                <span>アーカイブ</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
