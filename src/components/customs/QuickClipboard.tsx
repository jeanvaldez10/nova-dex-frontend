"use client";

// ######## Libraries 📦 & Hooks 🪝 ########
import { useCopyAddress } from "@/stores/use-copy-address";
// ######## Components 🧩 #########
import Link from "next/link";
import Image from "next/image";
import Separator from "@/components/customs/Separator";
import QuickBuyButton from "@/components/customs/buttons/QuickBuyButton";
// ######## Utils & Helpers 🤝 ########
import { cn } from "@/libraries/utils";

export default function QuickClipboard({
  parentClassName,
  wrapperClassName,
  withSeparator = false,
}: {
  parentClassName?: string;
  wrapperClassName?: string;
  withSeparator?: boolean;
}) {
  const detailCopied = useCopyAddress((state) => state.detailCopied);

  return (
    detailCopied && (
      <div
        className={cn(
          "absolute right-3 top-1/2 flex -translate-y-1/2 transform items-center justify-center gap-x-2",
          parentClassName,
        )}
      >
        {withSeparator && (
          <div>
            <Separator
              color="#2E2E47"
              orientation="vertical"
              unit="fixed"
              fixedHeight={12}
              className="hidden min-[1409px]:block"
            />
          </div>
        )}
        <div
          className={cn(
            "flex h-[30px] rounded-[32px] bg-[#17171F] py-1 pl-2 pr-[3px] text-right text-xs text-white",
            wrapperClassName,
          )}
        >
          <div className="flex flex-shrink-0 items-center justify-center gap-x-2">
            <div className="relative aspect-square h-4 w-4 flex-shrink-0 overflow-hidden rounded-full">
              <Image
                src="/icons/paste.svg"
                alt="Paste Icon"
                fill
                quality={100}
                className={"object-contain"}
              />
            </div>
            <Link
              href={`/token/${detailCopied?.mint}`}
              prefetch
              className="relative aspect-square h-4 w-4 flex-shrink-0 cursor-pointer overflow-hidden rounded-full"
            >
              <Image
                src={detailCopied?.image}
                alt="Token Image"
                fill
                quality={100}
                unoptimized={true}
                className="object-contain"
              />
            </Link>
            <Link
              href={`/token/${detailCopied?.mint}`}
              prefetch
              className="cursor-pointer font-geistMonoLight text-xs text-fontColorPrimary"
            >
              {detailCopied?.symbol}
            </Link>
            <div>
              <QuickBuyButton
                variant="marquee"
                mintAddress={detailCopied?.mint}
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
}
