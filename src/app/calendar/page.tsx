"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { AppShell } from "@/components/layout/AppShell";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { fetchEntriesByMonth } from "@/lib/apiClient";
import { toJapaneseMonthLabel } from "@/lib/date";
import { bindTap } from "@/lib/tap";
import type { DiaryEntry } from "@/lib/types";

function parseMonthParam(value: string | null): Date {
  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return new Date();
  }
  const parsed = new Date(`${value}-01T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export default function CalendarPage() {
  const router = useRouter();
  const thisMonth = useMemo(() => startOfMonth(new Date()), []);
  const [month, setMonth] = useState<Date>(new Date());
  const [hydrated, setHydrated] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const monthFromUrl = new URLSearchParams(window.location.search).get("month");
    const parsedMonth = parseMonthParam(monthFromUrl);
    const initialMonth = parsedMonth > thisMonth ? thisMonth : parsedMonth;
    setMonth(initialMonth);
    if (monthFromUrl !== format(initialMonth, "yyyy-MM")) {
      router.replace(`/calendar?month=${format(initialMonth, "yyyy-MM")}`, { scroll: false });
    }
    setHydrated(true);
  }, [router, thisMonth]);

  const moveMonth = (delta: number): void => {
    setMonth((current) => {
      const shifted = delta > 0 ? addMonths(current, delta) : subMonths(current, Math.abs(delta));
      const next = shifted > thisMonth ? thisMonth : shifted;
      router.replace(`/calendar?month=${format(next, "yyyy-MM")}`, { scroll: false });
      return next;
    });
  };

  const canGoNext = month < thisMonth;

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    setLoadError("");
    fetchEntriesByMonth(format(month, "yyyy-MM"))
      .then(setEntries)
      .catch(() => {
        setEntries([]);
        setLoadError("記録の読み込みに失敗しました");
      });
  }, [hydrated, month]);

  const recordDays = new Set(entries.map((entry) => entry.date)).size;
  const recordCount = entries.length;

  return (
    <AppShell>
      <section className="mb-4 px-1 pt-1 sm:px-2">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--ink-soft)]">GARDEN CALENDAR</p>
            <h2 className="text-xl font-extrabold text-[var(--ink)] sm:text-2xl">成長の記録</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
              {recordDays} days
            </div>
            <div className="rounded-xl bg-[var(--surface-soft)] border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
              {recordCount} entries
            </div>
          </div>
        </div>
        <div className="mb-3 grid grid-cols-[3rem_1fr_3rem] items-center gap-2">
          <button
            type="button"
            {...bindTap(() => moveMonth(-1))}
            className="app-btn-secondary touch-manipulation flex h-12 w-12 items-center justify-center"
            aria-label="前の月"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <h3 className="min-w-0 text-center text-2xl font-extrabold text-[var(--ink)] sm:text-3xl">{toJapaneseMonthLabel(month)}</h3>
          <button
            type="button"
            {...bindTap(() => canGoNext && moveMonth(1))}
            className="app-btn-secondary touch-manipulation flex h-12 w-12 items-center justify-center disabled:opacity-45"
            aria-label="次の月"
            disabled={!canGoNext}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
        {loadError ? <p className="mb-3 text-sm text-[#dcefdc]">{loadError}</p> : null}
        <CalendarGrid monthDate={month} entries={entries} />
      </section>
    </AppShell>
  );
}
