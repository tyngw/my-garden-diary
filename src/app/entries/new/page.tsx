"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EntryForm } from "@/components/entries/EntryForm";
import { fetchPlantTypes } from "@/lib/apiClient";
import { getTodayJst } from "@/lib/date";
import { useCompressionSettings } from "@/hooks/useCompressionSettings";
import type { PlantType } from "@/lib/types";

export default function NewEntryPage() {
  const router = useRouter();
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [settings] = useCompressionSettings();

  useEffect(() => {
    fetchPlantTypes().then(setPlantTypes).catch(console.error);
  }, []);

  return (
    <AppShell title="新規記録">
      <EntryForm
        initial={{ date: getTodayJst(), memo: "" }}
        plantTypes={plantTypes}
        settings={settings}
        submitLabel="記録を保存"
        onSubmit={async (payload) => {
          const res = await fetch("/api/entries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = (await res.json()) as { error?: string };
          if (!res.ok) {
            throw new Error(json.error ?? "保存できませんでした");
          }
          router.push("/calendar");
        }}
      />
    </AppShell>
  );
}
