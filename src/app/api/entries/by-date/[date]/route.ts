import { readDb } from "@/lib/db";

type Params = { params: Promise<{ date: string }> };

export async function GET(_: Request, { params }: Params): Promise<Response> {
  const { date } = await params;
  const entries = (await readDb()).entries.filter((entry) => entry.date === date);
  return Response.json({ entries });
}
