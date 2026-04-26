import { promises as fs } from "node:fs";
import path from "node:path";

type Params = { params: Promise<{ fileName: string }> };

const UPLOAD_DIR = path.join(process.cwd(), "data", "uploads");

function detectContentType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") {
    return "image/png";
  }
  if (ext === ".webp") {
    return "image/webp";
  }
  return "image/jpeg";
}

export async function GET(_: Request, { params }: Params): Promise<Response> {
  try {
    const { fileName } = await params;
    if (!fileName) {
      return Response.json({ error: "ファイルが見つかりません" }, { status: 404 });
    }

    const safeName = decodeURIComponent(fileName);
    if (safeName.includes("/") || safeName.includes("\\") || safeName.includes("..")) {
      return Response.json({ error: "ファイルが見つかりません" }, { status: 404 });
    }
    const filePath = path.join(UPLOAD_DIR, safeName);
    const file = await fs.readFile(filePath);
    return new Response(file, {
      headers: {
        "Content-Type": detectContentType(safeName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return Response.json({ error: "ファイルが見つかりません" }, { status: 404 });
  }
}
