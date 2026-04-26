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
  const trailing = (7 - ((offset + days.length) % 7)) % 7;
  const cells: Array<Date | null> = [
    ...Array.from({ length: offset }).map(() => null),
    ...days,
    ...Array.from({ length: trailing }).map(() => null),
  ];
  const rows = cells.length / 7;

  const map = entries.reduce<Record<string, DiaryEntry[]>>((acc, entry) => {
    acc[entry.date] = [...(acc[entry.date] ?? []), entry];
    return acc;
  }, {});

  return (
    <section className="overflow-hidden rounded-[1.25rem] border border-[rgb(47_122_89/55%)] bg-[var(--surface-soft)]">
      <div className="grid grid-cols-7 text-center text-xs font-semibold tracking-wide text-[var(--ink-soft)]">
        {weekLabels.map((label) => (
          <p key={label} className="border-b border-[rgb(47_122_89/40%)] px-1 py-2">{label}</p>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, index) => {
          const col = index % 7;
          const row = Math.floor(index / 7);
          const gridLineClass = [
            col < 6 ? "border-r border-[rgb(47_122_89/40%)]" : "",
            row < rows - 1 ? "border-b border-[rgb(47_122_89/40%)]" : "",
          ]
            .filter(Boolean)
            .join(" ");

          if (!day) {
            return <div key={`blank-${index}`} className={`min-h-[4.6rem] ${gridLineClass}`} />;
          }

          const dateKey = format(day, "yyyy-MM-dd");
          const items = map[dateKey] ?? [];
          const target = items.length > 1 ? `/entries/date/${dateKey}` : `/entries/${items[0]?.id}`;
          const today = isToday(day);
          const numberClass = today
            ? "inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#4cae68] px-1 text-sm font-bold text-[#f7fff9]"
            : "text-sm font-semibold text-[var(--ink)]";
          return (
            items.length ? (
              <Link key={dateKey} href={target} className={`relative z-10 flex min-h-[4.6rem] flex-col px-1.5 py-1.5 touch-manipulation ${gridLineClass}`} {...bindTap(() => router.push(target))}>
                <div className="flex h-6 items-center justify-center">
                  <span className={numberClass}>{format(day, "d")}</span>
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
              <div key={dateKey} className={`flex min-h-[4.6rem] flex-col px-1.5 py-1.5 ${gridLineClass}`}>
                <div className="flex h-6 items-center justify-center">
                  <span className={numberClass}>{format(day, "d")}</span>
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
