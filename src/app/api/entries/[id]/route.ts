import { readDb, updateDb } from "@/lib/db";
import { validateDate, validateImageUrls, validateMemo } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params): Promise<Response> {
  const { id } = await params;
  const entry = (await readDb()).entries.find((item) => item.id === id);
  if (!entry) {
    return Response.json({ error: "記録が見つかりません" }, { status: 404 });
  }
  return Response.json({ entry });
}

export async function PUT(request: Request, { params }: Params): Promise<Response> {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateDb((db) => {
      const target = db.entries.find((item) => item.id === id);
      if (!target) {
        return null;
      }
      target.date = validateDate(body.date);
      target.memo = validateMemo(body.memo);
      target.plantTypeId = typeof body.plantTypeId === "string" ? body.plantTypeId : null;
      target.imageUrls = validateImageUrls(body.imageUrls);
      target.updatedAt = new Date().toISOString();
      return target;
    });
    if (!updated) {
      return Response.json({ error: "記録が見つかりません" }, { status: 404 });
    }
    return Response.json({ entry: updated });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 400 },
    );
  }
}

export async function DELETE(_: Request, { params }: Params): Promise<Response> {
  try {
    const { id } = await params;
    const deleted = await updateDb((db) => {
      const index = db.entries.findIndex((item) => item.id === id);
      if (index < 0) {
        return null;
      }
      const [removed] = db.entries.splice(index, 1);
      return removed;
    });
    if (!deleted) {
      return Response.json({ error: "記録が見つかりません" }, { status: 404 });
    }
    return Response.json({ entry: deleted });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 400 },
    );
  }
}
