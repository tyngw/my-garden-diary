"use client";

import { useEffect, useMemo, useState } from "react";
import { ArchiveBoxArrowDownIcon, ArchiveBoxXMarkIcon, PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { bindTap } from "@/lib/tap";
import type { PlantType } from "@/lib/types";

type Props = {
  open: boolean;
  plantTypes: PlantType[];
  onClose: () => void;
  onUpdated: () => Promise<void>;
};

type DraftPlantType = PlantType & {
  isNew?: boolean;
  markedForDelete?: boolean;
};

function normalizeName(value: string): string {
  return value.trim().normalize("NFKC").toLocaleLowerCase("ja-JP");
}

function cloneTypes(items: PlantType[]): DraftPlantType[] {
  return items.map((item) => ({ ...item }));
}

export function PlantTypeSheet({ open, plantTypes, onClose, onUpdated }: Props) {
  const [newName, setNewName] = useState("");
  const [draftTypes, setDraftTypes] = useState<DraftPlantType[]>([]);
  const [entryCount, setEntryCount] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraftTypes(cloneTypes(plantTypes));
    setNewName("");
    setError("");
    fetch("/api/entries", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ entries: { plantTypeId: string | null }[] }>)
      .then(({ entries }) => {
        const counts: Record<string, number> = {};
        for (const e of entries) {
          if (e.plantTypeId) counts[e.plantTypeId] = (counts[e.plantTypeId] ?? 0) + 1;
        }
        setEntryCount(counts);
      })
      .catch(() => {});
  }, [open, plantTypes]);
  const originalById = useMemo(() => new Map(plantTypes.map((item) => [item.id, item])), [plantTypes]);
  const activeTypes = draftTypes.filter((p) => !p.archived && !p.markedForDelete);
  const archivedTypes = draftTypes.filter((p) => p.archived && !p.markedForDelete);
  const hasChanges = draftTypes.some((item) => {
    if (item.isNew || item.markedForDelete) {
      return true;
    }
    const original = originalById.get(item.id);
    if (!original) {
      return true;
    }
    return original.name !== item.name.trim() || original.archived !== item.archived;
  });

  if (!open) return null;

  const handleAdd = (): void => {
    const name = newName.trim();
    if (!name) return;
    const normalized = normalizeName(name);
    const duplicate = draftTypes
      .filter((item) => !item.markedForDelete)
      .some((item) => normalizeName(item.name) === normalized);
    if (duplicate) {
      setError("同じ名前の植物種がすでに存在します");
      return;
    }
    const now = new Date().toISOString();
    setError("");
    setDraftTypes((prev) => [
      ...prev,
      {
        id: `tmp-${crypto.randomUUID()}`,
        name,
        archived: false,
        createdAt: now,
        updatedAt: now,
        isNew: true,
      },
    ]);
    setNewName("");
  };

  const handleArchive = (id: string): void => {
    setDraftTypes((prev) => prev.map((item) => (item.id === id ? { ...item, archived: true } : item)));
  };

  const handleRestore = (id: string): void => {
    setDraftTypes((prev) => prev.map((item) => (item.id === id ? { ...item, archived: false } : item)));
  };

  const handleDelete = (id: string): void => {
    setDraftTypes((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) {
        return prev;
      }
      if (target.isNew) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) => (item.id === id ? { ...item, markedForDelete: true } : item));
    });
    setDeleteConfirmId(null);
  };

  async function requestJsonError(response: Response): Promise<Error> {
    const json = (await response.json().catch(() => ({}))) as { error?: string };
    return new Error(json.error ?? "保存に失敗しました");
  }

  const handleSave = async (): Promise<void> => {
    setError("");
    setSaving(true);
    try {
      if (!hasChanges) {
        onClose();
        return;
      }
      const names = draftTypes
        .filter((item) => !item.markedForDelete)
        .map((item) => normalizeName(item.name));
      const duplicateExists = names.some((name, index) => names.indexOf(name) !== index);
      if (duplicateExists) {
        throw new Error("同じ名前の植物種がすでに存在します");
      }

      for (const item of draftTypes) {
        if (item.markedForDelete) {
          const res = await fetch(`/api/plant-types/${item.id}`, { method: "DELETE" });
          if (!res.ok) {
            throw await requestJsonError(res);
          }
          continue;
        }
        if (item.isNew) {
          const res = await fetch("/api/plant-types", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: item.name.trim() }),
          });
          if (!res.ok) {
            throw await requestJsonError(res);
          }
          continue;
        }
        const original = originalById.get(item.id);
        if (!original) {
          continue;
        }
        const nextName = item.name.trim();
        const changedName = nextName !== original.name;
        const changedArchived = item.archived !== original.archived;
        if (!changedName && !changedArchived) {
          continue;
        }
        const payload: { name?: string; archived?: boolean } = {};
        if (changedName) {
          payload.name = nextName;
        }
        if (changedArchived) {
          payload.archived = item.archived;
        }
        const res = await fetch(`/api/plant-types/${item.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          throw await requestJsonError(res);
        }
      }
      await onUpdated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (): void => {
    setDraftTypes(cloneTypes(plantTypes));
    setNewName("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40">
      <button type="button" aria-label="閉じる" className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" {...bindTap(handleCancel)} />
      <section className="relative mx-auto flex h-dvh w-full max-w-[860px] flex-col bg-[var(--surface)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] text-[var(--ink)]">

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">植物の種類を管理</h3>
            <p className="text-sm text-[var(--ink-soft)]">追加、名称変更、アーカイブをここで管理できます。</p>
          </div>
          <button type="button" aria-label="閉じる" className="rounded-full p-1 hover:bg-[var(--surface-soft)]" {...bindTap(handleCancel)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain space-y-4 pr-0.5">

          {/* Add new */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); setError(""); }}
                placeholder="新しい種類を追加"
                className="app-input ios-safe-field ios-safe-field--compact"
              />
              {error ? <p className="mt-1 text-xs text-red-300">{error}</p> : null}
            </div>
            <button type="button" aria-label="追加" className="app-btn inline-flex h-11 w-11 items-center justify-center p-0" {...bindTap(handleAdd)}>
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Active types */}
          {activeTypes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink-soft)]">登録中</p>
              <div className="space-y-2">
                {activeTypes.map((item) => (
                  <div key={item.id} className="app-panel flex items-center gap-2 p-2">
                    <input
                      value={item.name}
                      onChange={(e) => {
                        setError("");
                        setDraftTypes((prev) =>
                          prev.map((target) => (target.id === item.id ? { ...target, name: e.target.value } : target)),
                        );
                      }}
                      className="app-input ios-safe-field ios-safe-field--compact flex-1"
                    />
                    <span className="shrink-0 text-xs text-[var(--ink-soft)]">{entryCount[item.id] ?? 0}件</span>
                    <button
                      type="button"
                      aria-label="アーカイブ"
                      title="アーカイブ"
                      disabled={item.id === "default-plant"}
                      className="app-btn-secondary inline-flex h-9 w-9 items-center justify-center p-0 disabled:opacity-40"
                      {...bindTap(() => handleArchive(item.id))}
                    >
                      <ArchiveBoxArrowDownIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Archived types */}
          {archivedTypes.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-[var(--ink-soft)]">アーカイブ済み</p>
              <div className="space-y-2">
                {archivedTypes.map((item) => (
                  <div key={item.id} className="app-panel flex items-center gap-2 p-2 opacity-70">
                    <span className="flex-1 truncate text-sm">{item.name}</span>
                    <span className="shrink-0 text-xs text-[var(--ink-soft)]">{entryCount[item.id] ?? 0}件</span>
                    <button
                      type="button"
                      aria-label="復元"
                      title="復元"
                      className="app-btn-secondary inline-flex h-9 w-9 items-center justify-center p-0 disabled:opacity-40"
                      {...bindTap(() => handleRestore(item.id))}
                    >
                      <ArchiveBoxXMarkIcon className="h-4 w-4" />
                    </button>
                    {(entryCount[item.id] ?? 0) === 0 && (
                      <button
                        type="button"
                        aria-label="完全削除"
                        title="完全削除"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[0.9rem] bg-red-700/80 p-0 text-white"
                        {...bindTap(() => setDeleteConfirmId(item.id))}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-4 flex gap-3">
          <button type="button" className="app-btn-secondary flex-1 rounded-xl py-3 font-semibold" {...bindTap(handleCancel)}>
            キャンセル
          </button>
          <button type="button" disabled={saving || !hasChanges} className="app-btn flex-1 rounded-xl py-3 font-semibold disabled:opacity-50" {...bindTap(handleSave)}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>

        {/* Delete confirm dialog */}
        {deleteConfirmId && (() => {
          const target = plantTypes.find((p) => p.id === deleteConfirmId);
          return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
              <div className="w-full max-w-xs rounded-2xl bg-[var(--surface)] p-6 text-center space-y-4">
                <p className="font-bold text-base">「{target?.name}」を完全削除しますか？</p>
                <p className="text-sm text-[var(--ink-soft)]">この操作は元に戻せません。</p>
                <div className="flex gap-3">
                  <button type="button" className="app-btn-secondary flex-1 rounded-xl py-2 font-semibold" {...bindTap(() => setDeleteConfirmId(null))}>
                    キャンセル
                  </button>
                  <button type="button" className="flex-1 rounded-xl bg-red-600 py-2 font-semibold text-white" {...bindTap(() => handleDelete(deleteConfirmId))}>
                    削除する
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </section>
    </div>
  );
}
