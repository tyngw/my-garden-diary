import { promises as fs } from "node:fs";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

export async function POST(request: Request): Promise<Response> {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "ファイルが必要です" }, { status: 400 });
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${crypto.randomUUID()}.jpg`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    await fs.writeFile(filePath, bytes);
    return Response.json({ imageUrl: `/api/uploads/${fileName}` }, { status: 201 });
  } catch {
    return Response.json({ error: "アップロードに失敗しました" }, { status: 500 });
  }
}
