"use client";

import Link from "next/link";
import Image from "next/image";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import type { DiaryEntry } from "@/lib/types";

type Props = {
  monthDate: Date;
  entries: DiaryEntry[];
};

const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarGrid({ monthDate, entries }: Props) {
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start: first, end: last });
  const offset = getDay(first);

  const map = entries.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    acc[entry.date] = [...(acc[entry.date] ?? []), entry];
    return acc;
  }, {});

  return (
    <section className="app-panel px-3 py-4 sm:px-4">
      <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold tracking-wide text-[var(--ink-soft)]">
        {weekLabels.map((label) => (
          <p key={label}>{label}</p>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`blank-${i}`} className="h-18" />
        ))}
        {days.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const items = map[dateKey] ?? [];
          const target = items.length > 1 ? `/entries/date/${dateKey}` : `/entries/${items[0]?.id}`;
          const today = isToday(day);
          const cellClass = `flex h-18 flex-col rounded-xl border px-1.5 py-1.5 ${
            today
              ? "border-[var(--primary)] bg-[var(--surface)]"
              : "border-[var(--line)] bg-[var(--surface-soft)]"
          }`;
          return (
            items.length ? (
              <Link key={dateKey} href={target} className={`${cellClass} touch-manipulation`}>
                <div className="flex h-6 items-center justify-center">
                  <span className={`text-sm font-semibold ${today ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>{format(day, "d")}</span>
                </div>
                <div className="flex h-10 items-center justify-center">
                  {items[0]?.imageUrls[0] ? (
                    <Image src={items[0].imageUrls[0]} alt="thumb" width={30} height={30} className="h-7 w-7 rounded-md object-cover" />
                  ) : (
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-[var(--primary)]" />
                  )}
                </div>
              </Link>
            ) : (
              <div key={dateKey} className={cellClass}>
                <div className="flex h-6 items-center justify-center">
                  <span className={`text-sm font-semibold ${today ? "text-[var(--accent)]" : "text-[var(--ink)]"}`}>{format(day, "d")}</span>
                </div>
                <div className="h-10" />
              </div>
            )
          );
        })}
      </div>
    </section>
  );
}
