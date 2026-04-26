import type { DiaryEntry, PlantType } from "@/lib/types";

async function parse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(json.error ?? "通信に失敗しました");
  }
  return json;
}

export async function fetchEntriesByMonth(month: string): Promise<DiaryEntry[]> {
  const response = await fetch(`/api/entries?month=${month}`, { cache: "no-store" });
  const json = await parse<{ entries: DiaryEntry[] }>(response);
  return json.entries;
}

export async function fetchEntriesByDate(date: string): Promise<DiaryEntry[]> {
  const response = await fetch(`/api/entries/by-date/${date}`, { cache: "no-store" });
  const json = await parse<{ entries: DiaryEntry[] }>(response);
  return json.entries;
}

export async function fetchAllEntries(): Promise<DiaryEntry[]> {
  const response = await fetch("/api/entries", { cache: "no-store" });
  const json = await parse<{ entries: DiaryEntry[] }>(response);
  return json.entries;
}

export async function fetchPlantTypes(includeArchived = false): Promise<PlantType[]> {
  const response = await fetch(`/api/plant-types?archived=${includeArchived}`);
  const json = await parse<{ plantTypes: PlantType[] }>(response);
  return json.plantTypes;
}
