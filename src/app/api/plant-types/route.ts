import { readDb, updateDb } from "@/lib/db";
import { validatePlantTypeName } from "@/lib/validation";
import type { PlantType } from "@/lib/types";

export async function GET(request: Request): Promise<Response> {
  const archived = new URL(request.url).searchParams.get("archived");
  const includeArchived = archived === "true";
  const plantTypes = (await readDb()).plantTypes.filter((item) => includeArchived || !item.archived);
  return Response.json({ plantTypes });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Partial<PlantType>;
    const now = new Date().toISOString();
    const plantType: PlantType = {
      id: crypto.randomUUID(),
      name: validatePlantTypeName(body.name),
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
    await updateDb((db) => {
      db.plantTypes.push(plantType);
    });
    return Response.json({ plantType }, { status: 201 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "不明なエラー" },
      { status: 400 },
    );
  }
}
