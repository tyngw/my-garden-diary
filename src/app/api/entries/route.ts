import { updateDb } from "@/lib/db";
import { validateDate, validateImageUrls, validateMemo } from "@/lib/validation";
import type { DiaryEntry } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const month = url.searchParams.get("month");
  const date = url.searchParams.get("date");
  const data = await updateDb((db) => db.entries);
  const filtered = data.filter((entry) => {
    if (month && !entry.date.startsWith(month)) {
      return false;
    }
    if (date && entry.date !== date) {
      return false;
    }
    return true;
  });
  return Response.json({ entries: filtered });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<DiaryEntry>;
    const now = new Date().toISOString();
    const created: DiaryEntry = {
      id: crypto.randomUUID(),
      date: validateDate(body.date),
      plantTypeId: typeof body.plantTypeId === "string" ? body.plantTypeId : null,
      memo: validateMemo(body.memo),
      imageUrls: validateImageUrls(body.imageUrls),
      createdAt: now,
      updatedAt: now,
    };
    await updateDb((db) => {
      db.entries.push(created);
    });
    return Response.json({ entry: created }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 400 },
    );
  }
}
