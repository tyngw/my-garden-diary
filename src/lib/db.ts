import { promises as fs } from "node:fs";
import path from "node:path";
import type { DbSchema, LegacyDiaryEntry } from "@/lib/types";

const dbPath = path.join(process.cwd(), "data", "db.json");
let writeQueue: Promise<void> = Promise.resolve();

const seed: DbSchema = {
  entries: [],
  plantTypes: [
    {
      id: "default-plant",
      name: "未分類",
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

function normalizeEntry(entry: LegacyDiaryEntry) {
  const imageUrls = Array.isArray(entry.imageUrls)
    ? entry.imageUrls.filter((url): url is string => typeof url === "string" && url.length > 0)
    : typeof entry.imageUrl === "string" && entry.imageUrl.length > 0
      ? [entry.imageUrl]
      : [];

  return {
    id: entry.id,
    date: entry.date,
    plantTypeId: entry.plantTypeId,
    memo: entry.memo,
    imageUrls,
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

function normalizeDb(raw: DbSchema | { entries: LegacyDiaryEntry[]; plantTypes: DbSchema["plantTypes"] }): DbSchema {
  return {
    plantTypes: raw.plantTypes,
    entries: raw.entries.map(normalizeEntry),
  };
}

export async function ensureDb(): Promise<void> {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(seed, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<DbSchema> {
  await ensureDb();
  const raw = await fs.readFile(dbPath, "utf-8");
  return normalizeDb(JSON.parse(raw) as DbSchema);
}

export async function writeDb(next: DbSchema): Promise<void> {
  await ensureDb();
  writeQueue = writeQueue.then(async () => {
    await fs.writeFile(dbPath, JSON.stringify(normalizeDb(next), null, 2), "utf-8");
  });
  await writeQueue;
}

export async function updateDb<T>(
  updater: (db: DbSchema) => T | Promise<T>,
): Promise<T> {
  const db = await readDb();
  const result = await updater(db);
  await writeDb(db);
  return result;
}
