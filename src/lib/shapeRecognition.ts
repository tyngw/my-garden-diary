export type Point = { x: number; y: number };

export type RecognizedShape =
  | { type: "line"; x1: number; y1: number; x2: number; y2: number }
  | { type: "circle"; cx: number; cy: number; r: number };

export const MARKER_LINE_WIDTH = 4;

function pathLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

function centroid(points: Point[]): Point {
  return {
    x: points.reduce((s, p) => s + p.x, 0) / points.length,
    y: points.reduce((s, p) => s + p.y, 0) / points.length,
  };
}

export function recognizeShape(points: Point[]): RecognizedShape {
  if (points.length < 2) {
    const p = points[0] ?? { x: 0, y: 0 };
    return { type: "line", x1: p.x, y1: p.y, x2: p.x, y2: p.y };
  }

  const first = points[0];
  const last = points[points.length - 1];
  const total = pathLength(points);
  const closingDist = Math.hypot(last.x - first.x, last.y - first.y);

  if (total > 30 && closingDist < total * 0.35) {
    const c = centroid(points);
    const r = points.reduce((s, p) => s + Math.hypot(p.x - c.x, p.y - c.y), 0) / points.length;
    return { type: "circle", cx: c.x, cy: c.y, r };
  }

  return { type: "line", x1: first.x, y1: first.y, x2: last.x, y2: last.y };
}
