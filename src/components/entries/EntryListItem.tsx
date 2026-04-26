import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/solid";
import type { DiaryEntry, PlantType } from "@/lib/types";

type Props = {
  entry: DiaryEntry;
  plantType?: PlantType;
};

export function EntryListItem({ entry, plantType }: Props) {
  const pathname = usePathname();
  const thumbnailUrl = entry.imageUrls[0];

  return (
    <Link href={`/entries/${entry.id}?from=${encodeURIComponent(pathname)}`} className="app-card flex items-center gap-3 p-3 transition hover:translate-y-[-1px]">
      <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[#d6e5dc] bg-[#f6faf7]">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt="entry" fill sizes="64px" className="object-cover" />
        ) : (
          <ChatBubbleLeftEllipsisIcon className="h-8 w-8 text-[#ea8a3a]" />
        )}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-[var(--ink)]">{plantType?.name ?? "未分類"}</p>
        <p className="line-clamp-2 text-sm text-[var(--ink-soft)]">{entry.memo || "メモなし"}</p>
      </div>
    </Link>
  );
}
