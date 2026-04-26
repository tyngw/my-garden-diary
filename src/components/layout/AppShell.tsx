import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";

type Props = {
  children: ReactNode;
  title?: string;
};

export function AppShell({ children, title }: Props) {
  return (
    <div className="min-h-dvh w-full pb-8">
      <AppHeader title={title} />
      <main className="relative mx-auto w-full max-w-[860px] px-4 pb-8 pt-4 sm:px-5 sm:pt-5">{children}</main>
    </div>
  );
}
