"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from "date-fns";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { bindTap } from "@/lib/tap";
import type { DiaryEntry } from "@/lib/types";

type Props = {
  monthDate: Date;
  entries: DiaryEntry[];
};

const weekLabels = ["日", "月", "火", "水", "木", "金", "土"];

export function CalendarGrid({ monthDate, entries }: Props) {
  const router = useRouter();
  const first = startOfMonth(monthDate);
  const last = endOfMonth(monthDate);
  const days = eachDayOfInterval({ start: first, end: last });
  const offset = getDay(first);

  const map = entries.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    acc[entry.date] = [...(acc[entry.date] ?? []), entry];
    return acc;
  }, {});

  return (
    <section className="rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface-soft)] px-3 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] sm:px-4">
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
          const hasEntries = items.length > 0;
          const cellClass = `flex h-18 flex-col rounded-xl border px-1.5 py-1.5 ${
            today
              ? "border-[#4cae68] bg-[#1f5c44] shadow-[0_10px_24px_-18px_rgba(0,0,0,0.4)]"
              : hasEntries
                ? "border-[#2f7a59] bg-[#184b37] shadow-[0_10px_24px_-20px_rgba(0,0,0,0.3)]"
                : "border-[#2f7a59] bg-[rgba(15,57,43,0.6)]"
          }`;
          return (
            items.length ? (
              <Link key={dateKey} href={target} className={`${cellClass} relative z-10 touch-manipulation`} {...bindTap(() => router.push(target))}>
                <div className="flex h-6 items-center justify-center">
                  <span className={`text-sm font-semibold ${today ? "text-[#a9f3c1]" : "text-[var(--ink)]"}`}>{format(day, "d")}</span>
                </div>
                <div className="flex h-10 items-center justify-center">
                  {items[0]?.imageUrls[0] ? (
                    <Image src={items[0].imageUrls[0]} alt="thumb" width={30} height={30} className="h-7 w-7 rounded-md object-cover" />
                  ) : (
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-[var(--accent)]" />
                  )}
                </div>
              </Link>
            ) : (
              <div key={dateKey} className={cellClass}>
                <div className="flex h-6 items-center justify-center">
                  <span className={`text-sm font-semibold ${today ? "text-[#204631]" : "text-[var(--ink)]"}`}>{format(day, "d")}</span>
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
