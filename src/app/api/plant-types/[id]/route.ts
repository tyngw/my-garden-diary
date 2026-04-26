import { readDb, updateDb } from "@/lib/db";
import { normalizePlantTypeName, validatePlantTypeName } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params): Promise<Response> {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = await updateDb((db) => {
      const target = db.plantTypes.find((item) => item.id === id);
      if (!target) {
        return null;
      }
      if (typeof body.name === "string") {
        const trimmed = validatePlantTypeName(body.name);
        const normalized = normalizePlantTypeName(trimmed);
        const duplicate = db.plantTypes.some(
          (item) => item.id !== id && normalizePlantTypeName(item.name) === normalized,
        );
        if (duplicate) {
          throw new Error("同じ名前の植物種がすでに存在します");
        }
        target.name = trimmed;
      }
      if (body.archived === true) {
        target.archived = true;
      }
      if (body.archived === false) {
        target.archived = false;
      }
      target.updatedAt = new Date().toISOString();
      return target;
    });
    if (!updated) {
      return Response.json({ error: "植物種が見つかりません" }, { status: 404 });
    }
    return Response.json({ plantType: updated });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, { params }: Params): Promise<Response> {
  try {
    const { id } = await params;
    const db = await readDb();
    const target = db.plantTypes.find((item) => item.id === id);
    if (!target) {
      return Response.json({ error: "植物種が見つかりません" }, { status: 404 });
    }
    const entryCount = db.entries.filter((e) => e.plantTypeId === id).length;
    if (entryCount > 0) {
      return Response.json({ error: "エントリが存在するため削除できません" }, { status: 409 });
    }
    await updateDb((d) => {
      d.plantTypes = d.plantTypes.filter((item) => item.id !== id);
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 400 },
    );
  }
}

