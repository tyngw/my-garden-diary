import { updateDb } from "@/lib/db";
import { validatePlantTypeName } from "@/lib/validation";

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
        target.name = validatePlantTypeName(body.name);
      }
      if (body.archived === true) {
        target.archived = true;
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
