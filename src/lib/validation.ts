const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateDate(value: unknown): string {
  if (typeof value !== "string" || !DATE_RE.test(value)) {
    throw new Error("日付形式が不正です");
  }
  return value;
}

export function validateMemo(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value !== "string") {
    throw new Error("メモ形式が不正です");
  }
  const trimmed = value.trim();
  if (trimmed.length > 200) {
    throw new Error("メモは200文字以内です");
  }
  return trimmed;
}

export function validatePlantTypeName(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("植物種の形式が不正です");
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("植物種名は必須です");
  }
  if (trimmed.length > 40) {
    throw new Error("植物種名は40文字以内です");
  }
  return trimmed;
}

export function validateImageUrls(value: unknown): string[] {
  if (value == null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error("画像データの形式が不正です");
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}
