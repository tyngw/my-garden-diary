import { format } from "date-fns";

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function toJstDate(iso: string): Date {
  const base = new Date(iso);
  return new Date(base.getTime() + JST_OFFSET_MS);
}

export function getTodayJst(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return format(new Date(utc + JST_OFFSET_MS), "yyyy-MM-dd");
}

export function toMonthKey(date: Date): string {
  return format(date, "yyyy-MM");
}

export function toJapaneseMonthLabel(date: Date): string {
  return format(date, "yyyy年M月");
}
