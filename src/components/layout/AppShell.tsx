import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

type Props = {
  children: ReactNode;
  title?: string;
  backHref?: string;
};

export function AppShell({ children, title, backHref }: Props) {
  return (
    <div className="min-h-screen w-full pb-8">
      <AppHeader title={title} backHref={backHref} />
      <main className="relative mx-auto w-full max-w-[860px] px-4 pb-8 pt-[calc(env(safe-area-inset-top)+4rem)] sm:px-5 sm:pt-[calc(env(safe-area-inset-top)+4.25rem)]">{children}</main>
    </div>
  );
}
