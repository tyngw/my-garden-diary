"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftIcon, Bars3Icon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { TouchEvent } from "react";

type Props = { title?: string };

/** iOS Safari 用: touchend で即時実行し、合成 click は無視する */
function tap(handler: () => void) {
  return {
    onTouchEnd(e: TouchEvent) {
      e.preventDefault();
      handler();
    },
    onClick: handler,
  };
}

export function AppHeader({ title = "MyGarden Diary" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isCalendar = pathname === "/calendar";
  const [menuPathname, setMenuPathname] = useState<string | null>(null);
  const menuOpen = menuPathname === pathname;

  const toggleMenu = (): void => {
    setMenuPathname((current) => (current === pathname ? null : pathname));
  };

  const closeMenu = (): void => {
    setMenuPathname(null);
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[color:rgba(15,57,43,0.88)] text-[#f5fff7] backdrop-blur-md">
        <div className="mx-auto h-13 w-full max-w-[860px] px-2 sm:px-3">
          <div className="relative h-full">
            <div className="absolute inset-y-0 left-0 flex items-center">
            {isCalendar ? (
              <Link
                href="/entries/new"
                aria-label="新しい記録"
                className="touch-manipulation rounded-full border border-white/12 bg-white/8 p-2 hover:bg-white/15"
              >
                <PlusIcon className="h-5 w-5" />
              </Link>
            ) : (
              <button
                type="button"
                {...tap(() => router.back())}
                className="touch-manipulation rounded-full border border-white/12 bg-white/8 p-2 hover:bg-white/15"
                aria-label="戻る"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            </div>
            <h1 className="pointer-events-none absolute inset-0 flex items-center justify-center px-16 text-center text-base font-bold tracking-[0.08em] sm:text-lg">
              <span className="truncate">{title}</span>
            </h1>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <button
                type="button"
                className="touch-manipulation rounded-full border border-white/12 bg-white/8 p-2 hover:bg-white/15"
                aria-label="メニュー"
                {...tap(toggleMenu)}
              >
                {menuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="メニューを閉じる"
            className="fixed inset-0 top-12 z-30 bg-black/25"
            {...tap(closeMenu)}
          />
          <nav className="fixed right-2 top-15 z-40 w-48 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-2 text-[var(--ink)] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.7)] sm:right-[max(0.75rem,calc((100vw-860px)/2+0.75rem))]">
            <div className="space-y-1">
              <Link href="/calendar" className="block rounded-xl px-3 py-2 text-sm hover:bg-[var(--surface-soft)]" onClick={closeMenu}>
                カレンダー
              </Link>
              <Link href="/settings" className="block rounded-xl px-3 py-2 text-sm hover:bg-[var(--surface-soft)]" onClick={closeMenu}>
                設定
              </Link>
            </div>
          </nav>
        </>
      ) : null}
    </>
  );
}
