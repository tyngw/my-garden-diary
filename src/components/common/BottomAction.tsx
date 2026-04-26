import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

type Props = {
  href: string;
  label: string;
};

export function BottomAction({ href, label }: Props) {
  return (
    <div className="fixed bottom-4 left-0 right-0 z-20 mx-auto w-full max-w-[860px] px-4">
      <Link
        href={href}
        className="app-btn flex items-center justify-center gap-1 px-4 py-3 text-base shadow-xl shadow-black/15"
      >
        <PlusIcon className="h-5 w-5" />
        {label}
      </Link>
    </div>
  );
}
