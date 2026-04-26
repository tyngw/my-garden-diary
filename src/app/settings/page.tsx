"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { useCompressionSettings } from "@/hooks/useCompressionSettings";

export default function SettingsPage() {
  const router = useRouter();
  const [saved, setSaved] = useCompressionSettings();
  const [draft, setDraft] = useState(saved);

  const handleSave = () => {
    setSaved(draft);
    router.replace("/calendar");
  };

  const handleCancel = () => {
    setDraft(saved);
    router.push("/calendar");
  };

  return (
    <AppShell title="設定">
      <section className="app-card space-y-3 p-4">
        <h2 className="text-lg font-bold text-[var(--ink)]">画像圧縮設定</h2>
        <p className="text-sm text-[var(--ink-soft)]">画像は記録画面で圧縮されてからアップロードされます。</p>
        <label className="block"><p className="mb-1 text-sm font-semibold text-[var(--ink-soft)]">幅</p><input type="number" value={draft.width} onChange={(e) => setDraft({ ...draft, width: Number(e.target.value) })} className="app-input ios-safe-field ios-safe-field--compact" /></label>
        <label className="block"><p className="mb-1 text-sm font-semibold text-[var(--ink-soft)]">高さ</p><input type="number" value={draft.height} onChange={(e) => setDraft({ ...draft, height: Number(e.target.value) })} className="app-input ios-safe-field ios-safe-field--compact" /></label>
        <label className="block"><p className="mb-1 text-sm font-semibold text-[var(--ink-soft)]">品質(%)</p><input type="number" min={1} max={100} value={draft.quality} onChange={(e) => setDraft({ ...draft, quality: Math.min(100, Math.max(1, Number(e.target.value))) })} className="app-input ios-safe-field ios-safe-field--compact" /></label>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={handleSave} className="app-btn flex-1 px-4 py-2">保存</button>
          <button type="button" onClick={handleCancel} className="app-btn-secondary flex-1 px-4 py-2">キャンセル</button>
        </div>
      </section>
    </AppShell>
  );
}
