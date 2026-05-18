import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

type Props = {
  children: ReactNode;
  title?: string;
  backHref?: string;
  hideMenu?: boolean;
  modal?: boolean;
};

export function AppShell({ children, title, backHref, hideMenu, modal }: Props) {
  const widthClass = modal ? "max-w-[640px]" : "max-w-[860px]";
  return (
    <div className="min-h-screen w-full pb-8">
      <AppHeader title={title} backHref={backHref} hideMenu={hideMenu} />
      <main className={`relative mx-auto w-full ${widthClass} px-4 pb-8 pt-[calc(env(safe-area-inset-top)+4rem)] sm:px-5 sm:pt-[calc(env(safe-area-inset-top)+4.25rem)]`}>
        {children}
      </main>
    </div>
  );
}
