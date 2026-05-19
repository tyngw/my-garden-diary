"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
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
  const [loadedThumbs, setLoadedThumbs] = useState<Record<string, boolean>>({});
  const [todayKey, setTodayKey] = useState("");
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

  useEffect(() => {
    setLoadedThumbs({});
  }, [entries, monthDate]);

  useEffect(() => {
    setTodayKey(format(new Date(), "yyyy-MM-dd"));
  }, []);

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
          const imageThumbs = items.flatMap((item) => item.imageUrls).slice(0, 3);
          const today = todayKey === dateKey;
          const numberClass = today
            ? "inline-flex min-h-6 min-w-6 items-center justify-center rounded-full bg-[#4cae68] px-1 text-sm font-bold text-[#f7fff9]"
            : "text-sm font-semibold text-[var(--ink)]";
          return (
            items.length ? (
              <Link key={dateKey} href={target} className={`relative z-10 flex min-h-[4.6rem] flex-col px-1.5 py-1.5 touch-manipulation ${gridLineClass}`} {...bindTap(() => router.push(target))}>
                <div className="flex h-6 items-center justify-center">
                  <span className={numberClass}>{format(day, "d")}</span>
                </div>
                <div className="relative flex h-10 items-center justify-center">
                  {imageThumbs.length ? (
                    imageThumbs.map((url, thumbIndex) => {
                      const thumbKey = `${dateKey}-${thumbIndex}-${url}`;
                      const shown = !!loadedThumbs[thumbKey];
                      return (
                        <Image
                          key={thumbKey}
                          src={url}
                          alt="thumb"
                          width={30}
                          height={30}
                          onLoadingComplete={() => {
                            setLoadedThumbs((current) => {
                              if (current[thumbKey]) {
                                return current;
                              }
                              return { ...current, [thumbKey]: true };
                            });
                          }}
                          className={`absolute h-7 w-7 rounded-md border border-white/60 object-cover shadow-sm transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`}
                          style={{
                            transform: `translate(${thumbIndex * 5 - 5}px, ${thumbIndex * 2}px)`,
                            opacity: shown ? 1 - thumbIndex * 0.25 : 0,
                            zIndex: 30 - thumbIndex,
                          }}
                        />
                      );
                    })
                  ) : (
                    <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-[var(--accent)]" />
                  )}
                </div>
              </Link>
            ) : (
              <button
                key={dateKey}
                type="button"
                className={`appearance-none border-0 bg-transparent text-inherit flex min-h-[4.6rem] w-full flex-col px-1.5 py-1.5 touch-manipulation ${gridLineClass}`}
                {...bindTap(() => router.push(`/entries/new?date=${dateKey}`))}
                aria-label={`新規記録を追加 (${format(day, "M/d")})`}
              >
                <div className="flex h-6 items-center justify-center">
                  <span className={numberClass}>{format(day, "d")}</span>
                </div>
                <div className="h-10" />
              </button>
            )
          );
        })}
      </div>
    </section>
  );
}
